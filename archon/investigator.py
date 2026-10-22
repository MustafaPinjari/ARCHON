"""ARCHON Investigation Engine.

Coordinates repository analysis, evidence assembly, and zero-hallucination synthesis.
"""

from __future__ import annotations
import os
import re
from typing import List, Optional
from archon.evidence import EvidenceItem, InvestigationResult, PillarType
from archon.repository import RepositoryManager, SecretScrubber
from archon.demo_data import get_demo_investigation


class Investigator:
    """Core engine for conducting engineering memory investigations."""

    def __init__(self, repo_path: Optional[str] = None, is_demo: bool = True):
        self.is_demo = is_demo
        self.repo_path = repo_path or ""
        self.manager: Optional[RepositoryManager] = None
        if not is_demo and repo_path:
            self.manager = RepositoryManager(repo_path)

    def investigate(self, symbol: str, question: str) -> InvestigationResult:
        """Conducts an investigation on the requested symbol and question."""
        if self.is_demo or not self.manager:
            return get_demo_investigation(symbol=symbol, question=question)

        # Local repository investigation
        val = self.manager.validation
        if not val.is_valid:
            return InvestigationResult(
                query=question,
                target_symbol=symbol,
                repository_path=self.repo_path,
                is_demo=False,
                status_label="LIVE REPOSITORY SCAN — ERROR",
                synthesis=(
                    f"**Cannot inspect repository**: {val.error_message}\n\n"
                    "Please verify that the directory path exists and points to a readable folder on this computer."
                ),
                items=[],
                capabilities_implemented=["Path validation & access bounds check"],
                capabilities_pending=["File scanning", "Git archaeology"],
                recommended_next_steps=["Check folder path permissions", "Ensure path is not inside a system directory"],
            )

        items: List[EvidenceItem] = []
        clean_symbol = symbol.strip()

        # Perform comprehensive token-boundary file search
        sym_results = self.manager.search_symbol(clean_symbol)

        # Identify primary definition file path for targeted Git search
        primary_file = sym_results.definitions[0].relative_path if sym_results.definitions else None

        # 1. Temporal Git History
        git_commits = []
        git_searches = []
        if val.is_git_repo:
            git_commits, git_searches = self.manager.search_git_symbol(
                clean_symbol,
                limit=4,
                file_path=primary_file,
            )
            for idx, c in enumerate(git_commits):
                details = self.manager.get_commit_details(c["hash"])
                payload = details or f"Commit {c['hash']}: {c['subject']}\nAuthor: {c['author']}\nDate: {c['date']}"
                items.append(
                    EvidenceItem(
                        id=f"GIT-LOCAL-{idx+1}",
                        pillar=PillarType.TEMPORAL_GIT,
                        title=f"Commit {c['hash']} — {c['subject']}",
                        location=f"Git History: Commit {c['hash']}",
                        summary=f"Authored by {c['author']} on {c['date']}",
                        verifiable_payload=payload,
                        confidence_label=f"Direct Git Pickaxe (Commit {c['hash']})",
                        author=c["author"],
                        timestamp=c["date"],
                        is_verified=True,
                    )
                )

        # 2. Architectural Contracts (Definitions & Docstrings)
        for idx, d in enumerate(sym_results.definitions):
            items.append(
                EvidenceItem(
                    id=f"CONTRACT-LOCAL-{idx+1}",
                    pillar=PillarType.CONTRACT_INVARIANT,
                    title=f"Definition in {d.relative_path}",
                    location=f"{d.relative_path}:Line {d.line_number}",
                    summary=f"Found symbol definition in {d.relative_path}.",
                    verifiable_payload=d.context_snippet or d.line_content,
                    confidence_label=f"Verified Source Definition (Line {d.line_number})",
                    is_verified=True,
                )
            )

        # 3. Verification Mesh (Direct Test Assertions & Component Suites)
        for idx, t in enumerate(sym_results.direct_tests[:6]):
            alias_note = f" (via alias '{t.alias}')" if t.alias else ""
            items.append(
                EvidenceItem(
                    id=f"TEST-DIRECT-{idx+1}",
                    pillar=PillarType.VERIFICATION_TEST,
                    title=f"Direct Test Reference in {t.relative_path}",
                    location=f"{t.relative_path}:Line {t.line_number}",
                    summary=f"Test assertion or invocation of '{clean_symbol}'{alias_note}.",
                    verifiable_payload=t.line_content,
                    confidence_label=f"Direct Test Assertion (Line {t.line_number})",
                    is_verified=True,
                )
            )

        for idx, suite_path in enumerate(sym_results.indirect_test_suites[:3]):
            items.append(
                EvidenceItem(
                    id=f"TEST-INDIRECT-{idx+1}",
                    pillar=PillarType.VERIFICATION_TEST,
                    title=f"Indirect Component Test Suite: {suite_path}",
                    location=suite_path,
                    summary=f"Located test suite guarding the enclosing component subsystem.",
                    verifiable_payload=f"Component Test Suite: {suite_path}\n(Co-located with defined symbol)",
                    confidence_label="Indirect Component Test Suite",
                    is_verified=True,
                )
            )

        # 4. Blast Radius (Callers & Imports)
        for idx, c in enumerate(sym_results.callers[:8]):
            alias_note = f" (via alias '{c.alias}')" if c.alias else ""
            label_kind = "Direct Import" if c.category == "import" else "Caller / Usage"
            items.append(
                EvidenceItem(
                    id=f"DEP-LOCAL-{idx+1}",
                    pillar=PillarType.STRUCTURAL_DEPENDENCY,
                    title=f"{label_kind} in {c.relative_path}",
                    location=f"{c.relative_path}:Line {c.line_number}",
                    summary=f"Found {label_kind.lower()} referencing '{clean_symbol}'{alias_note}.",
                    verifiable_payload=c.line_content,
                    confidence_label=f"Verified {label_kind} (Line {c.line_number})",
                    is_verified=True,
                )
            )

        # 5. Construct Honest, Empirical Synthesis
        branch_info = f" (Branch: `{val.git_branch}`)" if val.git_branch else ""
        synthesis_lines = [
            f"### Verified Engineering Investigation for `{clean_symbol}`",
            f"**Workspace**: `{val.resolved_path}`{branch_info}\n",
        ]

        # Definitions overview
        if sym_results.definitions:
            def_locs = ", ".join([f"`{d.relative_path}:Line {d.line_number}`" for d in sym_results.definitions[:3]])
            synthesis_lines.append(f"- **Architectural Definition**: Located **{len(sym_results.definitions)} definition(s)** in source code: {def_locs}.")
        else:
            synthesis_lines.append(
                f"- **Architectural Definition**: *Not found by this search*. No definition signature (`class`, `def`, `function`, etc.) "
                f"matching token `\\b{clean_symbol}\\b` was found across {sym_results.files_scanned_count} scanned source files."
            )

        # Git history overview
        if val.is_git_repo:
            if git_commits:
                commit_summaries = ", ".join([f"`{c['hash']}` ({c['subject'][:35]}...)" for c in git_commits[:2]])
                synthesis_lines.append(
                    f"- **Temporal Git Archaeology**: Located **{len(git_commits)} commit(s)** altering `{clean_symbol}`: {commit_summaries}."
                )
            else:
                synthesis_lines.append(
                    f"- **Temporal Git Archaeology**: *Not found by this search*. Neither Git pickaxe (`git log -S'{clean_symbol}'`) "
                    f"nor commit message search found matching changes in the recent history of branch `{val.git_branch or 'HEAD'}`. "
                    "Note: The symbol may have been committed in a bulk squash merge or introduced before recent log depth."
                )
        else:
            synthesis_lines.append(
                "- **Temporal Git Archaeology**: *Directory is not a Git repository*. No `.git` metadata was found, so commit history could not be queried."
            )

        # Test mesh overview
        total_tests_found = len(sym_results.direct_tests) + len(sym_results.indirect_test_suites)
        if sym_results.direct_tests:
            test_files = sorted(list({t.relative_path for t in sym_results.direct_tests}))
            synthesis_lines.append(
                f"- **Verification Mesh**: Located **{len(sym_results.direct_tests)} direct test assertion(s)** across **{len(test_files)} test file(s)** "
                f"({', '.join([f'`{f}`' for f in test_files[:2]])})."
            )
        elif sym_results.indirect_test_suites:
            synthesis_lines.append(
                f"- **Verification Mesh**: *No direct test invocations found*, but identified **{len(sym_results.indirect_test_suites)} co-located component test suite(s)**: "
                f"{', '.join([f'`{s}`' for s in sym_results.indirect_test_suites])}."
            )
        else:
            synthesis_lines.append(
                f"- **Verification Mesh**: *Not found by this search*. Inspected {sym_results.test_files_scanned_count} test files, "
                f"but found no direct references to `{clean_symbol}`. Changing this code carries higher regression risk."
            )

        # Blast radius overview
        if sym_results.callers:
            caller_files = sorted(list({c.relative_path for c in sym_results.callers}))
            synthesis_lines.append(
                f"- **Blast Radius**: Identified **{len(sym_results.callers)} usage/import reference(s)** across **{len(caller_files)} file(s)**."
            )
        else:
            synthesis_lines.append(
                f"- **Blast Radius**: *Not found by this search*. No external files were found importing or calling `{clean_symbol}`."
            )

        if sym_results.aliases_detected:
            synthesis_lines.append(
                f"- **Aliases Detected**: `{', '.join(sym_results.aliases_detected)}` (renamed via `import ... as ...`)."
            )

        # Transparent Searches & Limitations
        all_searches = sym_results.searches_performed + git_searches
        synthesis_lines.append("\n**Searches Executed by Engine**:")
        for s in all_searches[:5]:
            synthesis_lines.append(f"- `{s}`")

        synthesis_lines.append("\n**Search Boundaries & Limitations**:")
        for lim in sym_results.search_limitations:
            synthesis_lines.append(f"- {lim}")

        # Recommendations
        next_steps = []
        if sym_results.direct_tests:
            next_steps.append(f"Inspect direct test assertions in `{sym_results.direct_tests[0].relative_path}:Line {sym_results.direct_tests[0].line_number}` before refactoring.")
        elif sym_results.indirect_test_suites:
            next_steps.append(f"Run and inspect component test suite `{sym_results.indirect_test_suites[0]}` before making modifications.")
        else:
            next_steps.append(f"Write a unit test covering `{clean_symbol}` before refactoring, as no test assertions were found.")

        if git_commits:
            next_steps.append(f"Review Git commit `{git_commits[0]['hash']}` (`{git_commits[0]['subject']}`) for original design intent.")

        if sym_results.callers:
            next_steps.append(f"Verify blast radius in caller file `{sym_results.callers[0].relative_path}:Line {sym_results.callers[0].line_number}`.")

        return InvestigationResult(
            query=question,
            target_symbol=clean_symbol,
            repository_path=val.resolved_path,
            is_demo=False,
            status_label="LIVE LOCAL REPOSITORY FORENSIC",
            synthesis="\n".join(synthesis_lines),
            items=items,
            capabilities_implemented=[
                "Safe Local Path Validation (Directory Traversal Defense)",
                "Git CLI Pickaxe (-S) & File-Targeted Commit Archaeology",
                "Secret Scrubbing (AWS keys, GitHub tokens, Bearer tokens)",
                "Static Token-Boundary Scanner (Exact word boundaries)",
                "Import Alias Detection ('import ... as ...')",
                "Direct Test Reference Discovery & Indirect Suite Co-location",
                "Reverse Caller Dependency Detection with Exact Lines",
                "Transparent Search Diagnostics & Non-Fabricated Receipts",
            ],
            capabilities_pending=[
                "Tree-sitter Full Abstract Syntax Tree Graph (Planned for M2)",
                "Inter-procedural Dataflow Analysis (Planned for M2)",
                "PR & Issue Tracking Webhook Integration (Planned for M3)",
            ],
            recommended_next_steps=next_steps or ["Verify symbol usage in source files"],
        )

