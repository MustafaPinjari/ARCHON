"""Repository inspection, Git archaeology, and security boundary manager.

Enforces zero-execution static analysis, secret scrubbing, and safe path bounds.
"""

from __future__ import annotations
import os
import re
import subprocess
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple


# Files and directories to never scan or expose
BLOCKED_DIR_NAMES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
    ".idea",
    ".vscode",
    "target",
    "vendor",
    "env",
    ".pytest_cache",
}

BLOCKED_FILE_PATTERNS = [
    re.compile(r"^\.env(\..+)?$", re.IGNORECASE),
    re.compile(r".*\.(pem|key|pkcs12|pfx|p12|kdbx|crt)$", re.IGNORECASE),
    re.compile(r"^(id_rsa|id_ed25519|id_ecdsa)(\..+)?$", re.IGNORECASE),
    re.compile(r".*credential.*", re.IGNORECASE),
    re.compile(r".*secret.*", re.IGNORECASE),
]

ALLOWED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs", ".java",
    ".cpp", ".c", ".h", ".hpp", ".cs", ".rb", ".php", ".md",
    ".rst", ".json", ".yaml", ".yml", ".toml", ".sql", ".sh"
}

MAX_FILE_SIZE_BYTES = 500 * 1024  # 500 KB limit per file
MAX_FILES_SCANNED = 1500


@dataclass
class PathValidationResult:
    is_valid: bool
    resolved_path: str
    is_git_repo: bool
    error_message: Optional[str] = None
    git_branch: Optional[str] = None


@dataclass
class ScannedFile:
    relative_path: str
    absolute_path: str
    size_bytes: int
    is_test: bool


class SecretScrubber:
    """Detects and redacts potential secrets and API keys from text."""

    PATTERNS = [
        (re.compile(r"(AKIA[0-9A-Z]{16})"), "[REDACTED_AWS_KEY]"),
        (re.compile(r"(ghp_[0-9a-zA-Z]{36})"), "[REDACTED_GITHUB_PAT]"),
        (re.compile(r"(glpat-[0-9a-zA-Z\-_]{20,})"), "[REDACTED_GITLAB_TOKEN]"),
        (re.compile(r"(sk-[0-9a-zA-Z]{24,})"), "[REDACTED_OPENAI_KEY]"),
        (re.compile(r"(AIza[0-9A-Za-z\-_]{35})"), "[REDACTED_GOOGLE_API_KEY]"),
        (re.compile(r"(password|passwd|pwd)\s*=\s*['\"][^'\"]+['\"]", re.IGNORECASE), r"\1 = '***REDACTED***'"),
    ]

    @classmethod
    def scrub(cls, text: str) -> str:
        scrubbed = text
        for pattern, replacement in cls.PATTERNS:
            scrubbed = pattern.sub(replacement, scrubbed)
        return scrubbed

    @classmethod
    def is_blocked_file(cls, filename: str) -> bool:
        for pattern in BLOCKED_FILE_PATTERNS:
            if pattern.match(filename):
                return True
        return False


@dataclass
class SymbolOccurrence:
    """Represents a verified occurrence of a symbol in source or test code."""
    relative_path: str
    absolute_path: str
    line_number: int
    line_content: str
    category: str  # "definition", "direct_test", "import", "caller", "alias_usage"
    alias: Optional[str] = None
    context_snippet: Optional[str] = None


@dataclass
class SymbolSearchResults:
    """Structured results from scanning repository files for a symbol."""
    symbol: str
    definitions: List[SymbolOccurrence]
    direct_tests: List[SymbolOccurrence]
    callers: List[SymbolOccurrence]
    indirect_test_suites: List[str]
    aliases_detected: List[str]
    files_scanned_count: int
    test_files_scanned_count: int
    searches_performed: List[str]
    search_limitations: List[str]


class RepositoryManager:
    """Manages safe inspection of local Git workspaces."""

    def __init__(self, repo_path: str):
        self.raw_path = repo_path
        self.validation = self.validate_path(repo_path)
        self.root_path = self.validation.resolved_path if self.validation.is_valid else ""

    @staticmethod
    def validate_path(path_str: str) -> PathValidationResult:
        """Safely verifies that a directory exists, is accessible, and identifies if it is a Git repo."""
        if not path_str or not path_str.strip():
            return PathValidationResult(
                is_valid=False,
                resolved_path="",
                is_git_repo=False,
                error_message="Path is empty.",
            )

        try:
            resolved = os.path.realpath(os.path.abspath(path_str.strip()))
        except Exception as e:
            return PathValidationResult(
                is_valid=False,
                resolved_path="",
                is_git_repo=False,
                error_message=f"Path resolution error: {str(e)}",
            )

        if not os.path.exists(resolved):
            return PathValidationResult(
                is_valid=False,
                resolved_path=resolved,
                is_git_repo=False,
                error_message=f"Directory does not exist: {resolved}",
            )

        if not os.path.isdir(resolved):
            return PathValidationResult(
                is_valid=False,
                resolved_path=resolved,
                is_git_repo=False,
                error_message=f"Target path is a file, not a directory: {resolved}",
            )

        # Check for system root directories protection
        normalized = os.path.normpath(resolved).lower()
        if normalized in ["c:\\", "c:\\windows", "c:\\windows\\system32", "/", "/etc", "/var", "/usr"]:
            return PathValidationResult(
                is_valid=False,
                resolved_path=resolved,
                is_git_repo=False,
                error_message="Cannot inspect system root directory for safety reasons.",
            )

        # Check if Git repository
        is_git = False
        git_branch = None
        try:
            proc = subprocess.run(
                ["git", "rev-parse", "--is-inside-work-tree"],
                cwd=resolved,
                capture_output=True,
                text=True,
                timeout=5,
            )
            if proc.returncode == 0 and "true" in proc.stdout.strip():
                is_git = True
                branch_proc = subprocess.run(
                    ["git", "branch", "--show-current"],
                    cwd=resolved,
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                if branch_proc.returncode == 0:
                    git_branch = branch_proc.stdout.strip() or "HEAD (detached)"
        except Exception:
            is_git = False

        return PathValidationResult(
            is_valid=True,
            resolved_path=resolved,
            is_git_repo=is_git,
            git_branch=git_branch,
        )

    def scan_files(self) -> List[ScannedFile]:
        """Scans valid source and test files while honoring all safety boundaries."""
        if not self.validation.is_valid:
            return []

        scanned: List[ScannedFile] = []
        for root, dirs, files in os.walk(self.root_path):
            # Prune blocked directories in-place
            dirs[:] = [d for d in dirs if d not in BLOCKED_DIR_NAMES and not d.startswith(".")]

            for file in files:
                if len(scanned) >= MAX_FILES_SCANNED:
                    break

                if SecretScrubber.is_blocked_file(file):
                    continue

                _, ext = os.path.splitext(file)
                if ext.lower() not in ALLOWED_EXTENSIONS:
                    continue

                full_path = os.path.join(root, file)
                try:
                    size = os.path.getsize(full_path)
                except OSError:
                    continue

                if size > MAX_FILE_SIZE_BYTES or size == 0:
                    continue

                rel_path = os.path.relpath(full_path, self.root_path).replace("\\", "/")
                is_test = (
                    "test" in rel_path.lower()
                    or file.startswith("test_")
                    or file.endswith(("_test.py", ".test.js", ".test.ts", ".spec.ts", ".spec.js", "tests.py"))
                )

                scanned.append(
                    ScannedFile(
                        relative_path=rel_path,
                        absolute_path=full_path,
                        size_bytes=size,
                        is_test=is_test,
                    )
                )

        return scanned

    def search_git_symbol(
        self,
        symbol: str,
        limit: int = 5,
        file_path: Optional[str] = None,
    ) -> Tuple[List[Dict[str, str]], List[str]]:
        """Finds commits that added or modified the symbol using git log.
        
        Returns:
            Tuple of (commit_records, searches_performed)
        """
        if not self.validation.is_git_repo:
            return [], ["Git history search skipped: Target directory is not a Git repository."]

        cleaned_symbol = symbol.strip()
        if not cleaned_symbol:
            return [], ["Git search skipped: Symbol is empty."]

        results: List[Dict[str, str]] = []
        searches_performed: List[str] = []
        seen_hashes = set()

        # 1. If target file is known, run file-targeted pickaxe first
        if file_path:
            norm_rel = file_path.replace("\\", "/")
            searches_performed.append(f"git log -S'{cleaned_symbol}' -n {limit} -- {norm_rel}")
            try:
                cmd = [
                    "git", "log", f"-S{cleaned_symbol}",
                    f"-n{limit}",
                    "--pretty=format:%h%x1f%an%x1f%ad%x1f%s%x1e",
                    "--date=iso",
                    "--", norm_rel
                ]
                proc = subprocess.run(
                    cmd,
                    cwd=self.root_path,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                self._parse_git_log_output(proc.stdout, results, seen_hashes)
            except Exception:
                pass

        # 2. General pickaxe across repository tree if more commits needed
        if len(results) < limit:
            pickaxe_cmd = f"git log -S'{cleaned_symbol}' -n {limit}"
            searches_performed.append(pickaxe_cmd)
            try:
                cmd = [
                    "git", "log", f"-S{cleaned_symbol}",
                    f"-n{limit}",
                    "--pretty=format:%h%x1f%an%x1f%ad%x1f%s%x1e",
                    "--date=iso",
                ]
                proc = subprocess.run(
                    cmd,
                    cwd=self.root_path,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                self._parse_git_log_output(proc.stdout, results, seen_hashes)
            except Exception:
                pass

        # 3. Fallback to commit message grep if still empty
        if not results:
            grep_cmd = f"git log --grep='{cleaned_symbol}' -n {limit}"
            searches_performed.append(grep_cmd)
            try:
                cmd = [
                    "git", "log", f"--grep={cleaned_symbol}",
                    f"-n{limit}",
                    "--pretty=format:%h%x1f%an%x1f%ad%x1f%s%x1e",
                    "--date=iso",
                ]
                proc = subprocess.run(
                    cmd,
                    cwd=self.root_path,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                self._parse_git_log_output(proc.stdout, results, seen_hashes)
            except Exception:
                pass

        return results[:limit], searches_performed

    @staticmethod
    def _parse_git_log_output(raw_output: str, results_list: List[Dict[str, str]], seen_hashes: set) -> None:
        raw = raw_output.strip()
        if not raw:
            return
        commits = raw.split("\x1e")
        for c in commits:
            c = c.strip()
            if not c:
                continue
            parts = c.split("\x1f")
            if len(parts) >= 4:
                commit_hash = parts[0].strip()
                if commit_hash and commit_hash not in seen_hashes:
                    seen_hashes.add(commit_hash)
                    results_list.append({
                        "hash": commit_hash,
                        "author": parts[1].strip(),
                        "date": parts[2].strip(),
                        "subject": SecretScrubber.scrub(parts[3].strip()),
                    })

    def get_commit_details(self, commit_hash: str) -> Optional[str]:
        """Fetches commit stat and message safely."""
        if not self.validation.is_git_repo:
            return None

        # Clean hash to avoid arbitrary arg injection
        safe_hash = re.sub(r"[^a-zA-Z0-9_\-]", "", commit_hash)
        if not safe_hash:
            return None

        try:
            proc = subprocess.run(
                ["git", "show", "--stat", safe_hash],
                cwd=self.root_path,
                capture_output=True,
                text=True,
                timeout=6,
            )
            if proc.returncode == 0:
                return SecretScrubber.scrub(proc.stdout[:2500])
        except Exception:
            return None
        return None

    def search_symbol(self, symbol: str) -> SymbolSearchResults:
        """Thoroughly searches for definitions, aliases, callers, and tests with token boundaries."""
        files = self.scan_files()
        cleaned_symbol = symbol.strip()

        if not cleaned_symbol:
            return SymbolSearchResults(
                symbol="",
                definitions=[],
                direct_tests=[],
                callers=[],
                indirect_test_suites=[],
                aliases_detected=[],
                files_scanned_count=0,
                test_files_scanned_count=0,
                searches_performed=["Search skipped: Symbol is empty."],
                search_limitations=["Empty query."],
            )

        # Regex patterns for token boundaries and aliases
        exact_pattern = re.compile(rf"\b{re.escape(cleaned_symbol)}\b")
        def_pattern = re.compile(rf"\b(class|def|async def|function|fn|pub fn|struct|interface|type)\s+{re.escape(cleaned_symbol)}\b")
        import_pattern = re.compile(rf"\b(from\s+[\w\.]+\s+)?import\s+.*?\b{re.escape(cleaned_symbol)}\b")
        alias_pattern = re.compile(rf"\b(?:from\s+[\w\.]+\s+)?import\s+.*?\b{re.escape(cleaned_symbol)}\s+as\s+(\w+)")

        definitions: List[SymbolOccurrence] = []
        direct_tests: List[SymbolOccurrence] = []
        callers: List[SymbolOccurrence] = []
        aliases_detected: List[str] = []
        test_files_scanned = [f for f in files if f.is_test]
        definition_directories = set()

        searches_performed = [
            f"Token-boundary pattern `\\b{cleaned_symbol}\\b` across {len(files)} source/doc files.",
            f"Definition patterns `(class|def|function|...) {cleaned_symbol}` for architectural contracts.",
            f"Import alias detection `... as <alias>` to identify renamed references.",
            f"Inspected {len(test_files_scanned)} test suites for direct assertions and component coverage.",
        ]

        search_limitations = [
            "Searches are restricted to supported text extensions (.py, .js, .ts, .go, .rs, .md, etc.) under 500 KB.",
            "Dynamic reflection (e.g. getattr(module, name) or importlib) cannot be verified without code execution.",
            "Files inside .git, node_modules, and virtual environments are excluded by security boundary.",
        ]

        # Scan each file
        for f in files:
            try:
                with open(f.absolute_path, "r", encoding="utf-8", errors="ignore") as fh:
                    lines = fh.readlines()
            except Exception:
                continue

            file_alias: Optional[str] = None
            alias_regex: Optional[re.Pattern] = None

            # First pass on file: check if this file defines an alias for the symbol
            for line in lines:
                alias_match = alias_pattern.search(line)
                if alias_match:
                    file_alias = alias_match.group(1)
                    if file_alias not in aliases_detected:
                        aliases_detected.append(file_alias)
                    alias_regex = re.compile(rf"\b{re.escape(file_alias)}\b")
                    break

            # Second pass: scan lines for symbol or alias occurrences
            for idx, line in enumerate(lines, start=1):
                has_exact = bool(exact_pattern.search(line))
                has_alias = bool(alias_regex and alias_regex.search(line))

                if not (has_exact or has_alias):
                    continue

                scrubbed_line = SecretScrubber.scrub(line.strip())
                is_alias_line = has_alias and not has_exact

                if f.is_test:
                    direct_tests.append(
                        SymbolOccurrence(
                            relative_path=f.relative_path,
                            absolute_path=f.absolute_path,
                            line_number=idx,
                            line_content=scrubbed_line,
                            category="direct_test",
                            alias=file_alias if is_alias_line else None,
                        )
                    )
                elif def_pattern.search(line) and not is_alias_line:
                    # Extract surrounding docstring or context (up to 5 lines after definition)
                    docstring_lines = [scrubbed_line]
                    for next_line in lines[idx: idx + 6]:
                        clean_next = SecretScrubber.scrub(next_line.rstrip())
                        docstring_lines.append(clean_next)
                        if '"""' in next_line or "'''" in next_line:
                            if len(docstring_lines) > 2 and ('"""' in clean_next or "'''" in clean_next):
                                break
                    context_snippet = "\n".join(docstring_lines)

                    definitions.append(
                        SymbolOccurrence(
                            relative_path=f.relative_path,
                            absolute_path=f.absolute_path,
                            line_number=idx,
                            line_content=scrubbed_line,
                            category="definition",
                            context_snippet=context_snippet,
                        )
                    )
                    # Record directory of definition for indirect test mapping
                    definition_directories.add(os.path.dirname(f.relative_path))
                elif import_pattern.search(line):
                    callers.append(
                        SymbolOccurrence(
                            relative_path=f.relative_path,
                            absolute_path=f.absolute_path,
                            line_number=idx,
                            line_content=scrubbed_line,
                            category="import",
                            alias=file_alias if is_alias_line else None,
                        )
                    )
                else:
                    callers.append(
                        SymbolOccurrence(
                            relative_path=f.relative_path,
                            absolute_path=f.absolute_path,
                            line_number=idx,
                            line_content=scrubbed_line,
                            category="caller" if not is_alias_line else "alias_usage",
                            alias=file_alias if is_alias_line else None,
                        )
                    )

        # Detect indirect test suites (tests in same app/subsystem as definitions)
        indirect_test_suites: List[str] = []
        direct_test_files = {t.relative_path for t in direct_tests}

        for tf in test_files_scanned:
            tf_dir = os.path.dirname(tf.relative_path)
            for def_dir in definition_directories:
                # Same directory or common app root
                if def_dir and (def_dir == tf_dir or tf_dir.startswith(def_dir) or def_dir.startswith(tf_dir)):
                    if tf.relative_path not in direct_test_files and tf.relative_path not in indirect_test_suites:
                        indirect_test_suites.append(tf.relative_path)

        return SymbolSearchResults(
            symbol=cleaned_symbol,
            definitions=definitions,
            direct_tests=direct_tests,
            callers=callers,
            indirect_test_suites=indirect_test_suites,
            aliases_detected=aliases_detected,
            files_scanned_count=len(files),
            test_files_scanned_count=len(test_files_scanned),
            searches_performed=searches_performed,
            search_limitations=search_limitations,
        )

    def search_symbol_in_files(self, symbol: str) -> List[Tuple[ScannedFile, int, str]]:
        """Legacy helper maintained for backward compatibility."""
        results = self.search_symbol(symbol)
        legacy_matches: List[Tuple[ScannedFile, int, str]] = []

        all_occs = results.definitions + results.direct_tests + results.callers
        file_map = {f.relative_path: f for f in self.scan_files()}

        for occ in all_occs:
            scanned = file_map.get(occ.relative_path)
            if scanned:
                legacy_matches.append((scanned, occ.line_number, occ.line_content))
            if len(legacy_matches) >= 50:
                break

        return legacy_matches

