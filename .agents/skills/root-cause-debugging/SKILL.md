---
name: root-cause-debugging
description: Guides systematic root-cause debugging, error isolation, hypothesis testing, minimal fix authoring, and regression test creation.
---

# Root-Cause Debugging Skill

## Purpose
This skill establishes a disciplined, scientific process for diagnosing and fixing software bugs in ARCHON. It prohibits random trial-and-error editing across multiple files and enforces identifying the true root cause before applying a minimal fix.

## Activation Criteria
Activate this skill whenever:
- An automated test fails.
- An API returns unexpected HTTP 500 or malformed data.
- The frontend encounters a runtime React error or console warning.
- A subprocess or database query crashes or hangs.

## Required Tools
- `view_file`: Read stack traces, logs, and relevant source code lines.
- `run_command`: Run targeted test commands or debug scripts.
- `replace_file_content`: Apply minimal targeted fixes.

## The 9-Step Debugging Procedure
1. **Reproduce the Issue:**
   - Execute the exact command or request that triggered the failure. Capture the raw error message, stack trace, and input payload.
2. **Capture Environment & State:**
   - Record Python/Node versions, OS environment, active database connection, and directory path.
3. **Formulate Plausible Hypotheses:**
   - Identify 2-3 specific mechanisms that could produce this exact failure (e.g. unhandled `None`, path normalization mismatch on Windows, missing Cypher index).
4. **Test Hypotheses Scientifically:**
   - Add a minimal assertion or inspection log to test each hypothesis without altering business logic.
5. **Pinpoint the Root Cause:**
   - Identify the exact line, contract violation, or assumption failure that initiates the bug.
6. **Apply a Minimal, Coherent Fix:**
   - Edit only the specific code required to correct the root cause. Avoid broad refactorings during a bug fix.
7. **Add an Automated Regression Test:**
   - Write a test that specifically reproduces the original bug condition and confirms the fix.
8. **Rerun Full Test Suite:**
   - Execute `.\.venv\Scripts\python.exe -m pytest` and frontend linting to confirm zero regressions.
9. **Review for Side Effects:**
   - Check if any related callers or serializers depend on the previous behavior.

## Anti-Patterns to Avoid
- **"Shotgun Debugging":** Modifying multiple unrelated files simultaneously in the hope that the error disappears.
- **Suppressing Exceptions:** Wrapping failing code in `try: ... except Exception: pass` without handling or logging the error.
- **Deleting Failing Tests:** Deleting or commenting out a test rather than fixing the broken code.

## Verification Criteria
- [ ] Root cause is clearly articulated in the review/report.
- [ ] Regression test is added and passes.
- [ ] Baseline test suite passes with zero regressions.

## Expected Deliverables
- Minimal source code fix.
- New regression test guarding against future occurrences.
- Diagnostic explanation of what broke and why the fix resolves it.
