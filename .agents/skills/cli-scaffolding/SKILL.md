---
name: cli-scaffolding
description: Guides the use of official CLI generators, migration tools, and project scaffolders while preventing manual boilerplate recreation.
---

# Framework-Native Scaffolding & CLI Engineering Skill

## Purpose
This skill enforces using official command-line tools and project generators instead of hand-crafting framework boilerplate. Hand-written boilerplate frequently misses configuration flags, security defaults, and directory structures.

## Activation Criteria
Activate this skill whenever:
- Creating a new service, app, or component (e.g. Django app, Next.js component).
- Running database migrations (`makemigrations`, `migrate`).
- Adding or upgrading packages via `pip` or `npm`.
- Running linting, type-checking, or building production bundles.

## Required Tools
- `run_command`: Execute official CLI tools via PowerShell on Windows.
- `view_file`: Inspect generated manifests and configurations.

## Critical Windows Execution Rules
- On Windows PowerShell, npm scripts may be blocked by execution policies. Always invoke `npm.cmd` and `npx.cmd` directly.
- Always use the virtual environment's Python executable (`.\.venv\Scripts\python.exe`) rather than the global `python` command.

## Step-by-Step Procedure
1. **Pre-Execution Inspection:**
   - Check current working directory (`pwd` or check `Cwd` parameter).
   - Verify whether the target folder, app, or file already exists to prevent accidental overwrites.
   - Check Git status or working tree to ensure no uncommitted files are at risk.
2. **Select Official Framework Generator:**
   - **Django:** Use `.\.venv\Scripts\python.exe manage.py startapp <app_name>` or `django-admin startproject`.
   - **Django Migrations:** Use `.\.venv\Scripts\python.exe manage.py makemigrations` followed by `manage.py sqlmigrate` to inspect before `manage.py migrate`.
   - **Frontend / Next.js:** Use `npm.cmd install <package>` or `npx.cmd` generators.
   - **Linting & Formatting:** Use `npm.cmd run lint`, `.\.venv\Scripts\python.exe -m ruff check`, or `.\.venv\Scripts\python.exe -m pytest`.
3. **Run Command with Honest Reporting:**
   - Execute the command using `run_command` with sufficient timeout (`WaitMsBeforeAsync`).
   - If executed as a daemon or background task, inspect the task log before claiming completion.
   - Never claim a command succeeded if it was not actually executed.
4. **Post-Execution Verification:**
   - Verify generated files: check that new files have valid imports, expected directory structure, and no syntax errors.
   - Run linter and tests to ensure no regressions were introduced.

## Verification Criteria
- [ ] Command output shows exit code 0 or successful completion.
- [ ] Generated files match official framework patterns (e.g. Django `apps.py`, `models.py`, `tests.py`).
- [ ] No manual copy-pasting of complex framework scaffolding.

## Failure Handling
- If a generator errors (e.g. "app already exists" or "dependency conflict"), inspect the exact stderr message, resolve the conflict (e.g. pass `--legacy-peer-deps` or use existing app), and rerun.

## Expected Deliverables
- Cleanly generated framework files adhering to official conventions.
- Verifiable terminal log confirming successful command execution.
