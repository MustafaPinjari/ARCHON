---
name: archon-investigator
description: Guide for performing verifiable engineering memory investigations across Git history, tests, and source code.
---

# Archon Engineering Memory Investigator Skill

This skill guides engineers and AI agents in performing **ground-truth code archaeology** to answer *why* unfamiliar code was written, using verifiable evidence rather than LLM speculation.

## 4 Pillars of Evidence

When investigating an unfamiliar function, class, or module:

1. **Temporal Intent (Git Archaeology)**:
   - Identify the commit that introduced the symbol (`git log -S <symbol>` or `git log -L`).
   - Extract the commit message, author, timestamp, and PR/issue tags.
   - Look for keywords: `fix:`, `refactor:`, `workaround:`, `idempotency`, `CVE-`.

2. **Architectural Contract (Source Invariants)**:
   - Read the exact docstrings, inline design comments, type hints, and exception contracts.
   - Identify explicit trade-offs mentioned in comments (e.g. `// Note: Must lock before write to prevent race condition in Kafka consumer`).

3. **Verification Mesh (Test Evidence)**:
   - Locate test files asserting the behavior of this symbol.
   - Identify test cases guarding against regressions (e.g. `test_retry_after_timeout_does_not_double_charge`).

4. **Blast Radius (Dependency Graph)**:
   - Scan modules that import or invoke this symbol.
   - Calculate what other subsystems are affected if this code is modified.

## Zero-Hallucination Rules
- Never speculate on design motives without citing a commit hash, line number, or test name.
- If a commit message is cryptic (e.g., `update`), honestly report: *"Commit intent is undocumented; relying on source comments and test assertions."*
- Separate confirmed facts from inferred hypotheses.
