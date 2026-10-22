---
name: git-code-review
description: Guides safe Git operations, diff inspection, non-destructive workflows, dead-code detection, and pull-request readiness review.
---

# Git, Code Review & Technical Debt Management Skill

## Purpose
This skill governs version control hygiene, diff inspections, and code reviews in ARCHON. It guarantees that all changes are safe, non-destructive, minimal, and reviewable by human engineers.

## Activation Criteria
Activate this skill whenever:
- Preparing to make edits across the codebase.
- Reviewing Git status, branch state, or diffs before committing.
- Auditing code for dead code, duplicate functions, or technical debt.
- Reviewing PR readiness and documentation completeness.

## Required Tools
- `run_command`: Inspect Git status, diffs, branches, and commit history.
- `view_file`: Review changed files side-by-side.

## Absolute Prohibitions (Non-Negotiable)
- **NEVER** run destructive Git commands without explicit user instruction:
  - Prohibited: `git reset --hard`
  - Prohibited: `git clean -fd`
  - Prohibited: `git push --force`
  - Prohibited: `git checkout .` (wiping working tree)
- **NEVER** rewrite commit history on shared branches.
- **NEVER** commit secrets, private tokens, or `.env` files.

## Step-by-Step Code Review Procedure
1. **Pre-Change Verification:**
   - Check if working directory is inside a Git repository (`git rev-parse --is-inside-work-tree`).
   - Check status (`git status -s`) to avoid interfering with uncommitted user work.
2. **Inspect Diffs Surgically:**
   - Run `git diff` to review all modified lines.
   - Verify every line change maps directly to the user's objective or acceptance criteria.
   - Revert any unintended whitespace or formatting alterations in unrelated files.
3. **Dead Code & Duplication Audit:**
   - Search for unused imports, orphaned helper functions, or copy-pasted blocks.
   - Remove unused variables or imports flagged by linters.
4. **Documentation Sync:**
   - Verify that any modified API endpoint, setting, or architecture pattern is reflected in `README.md` and `docs/`.
5. **Commit Crafting:**
   - Write clear, conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.
   - Keep commits atomic and logically separated.

## Verification Criteria
- [ ] Diff is minimal, focused, and free of extraneous changes.
- [ ] No accidental secrets or credentials committed.
- [ ] Unrelated user files remain untouched.
- [ ] All tests pass against the final diff.

## Expected Deliverables
- Clean Git diff review summary.
- Focused, reviewable commit or PR description.
