---
name: tdd-quality-assurance
description: Guides test-driven development, acceptance test authoring, pytest and frontend verification, regression prevention, and honest test reporting.
---

# Test-Driven Development & Quality Assurance Skill

## Purpose
This skill establishes strict test-driven development (TDD) and QA verification for ARCHON. It ensures all business logic, static parsers, Git extractors, and API endpoints have automated, reproducible test coverage.

## Activation Criteria
Activate this skill whenever:
- Adding a new capability or algorithm in `archon/core/`.
- Fixing a bug or unexpected behavior (requires a reproducing regression test).
- Creating or updating API endpoints in `api/`.
- Preparing code for review or deployment.

## Required Tools
- `run_command`: Run test suites (`pytest`, `npm test`).
- `view_file` / `replace_file_content` / `write_to_file`: Author test cases.

## Non-Negotiable Testing Rules
1. **Never Weaken Tests to Pass:**
   - Never delete an assertion or mock away the core behavior simply to turn a red test green. Fix the underlying code.
2. **Honest Reporting:**
   - If a test cannot be executed (e.g. database daemon unavailable), report it as **NOT VERIFIED**. Never claim a test passed without running it.
3. **Dedicated Test Data:**
   - Use isolated temporary directories (`tmp_path` fixture) for file system tests. Never mutate the live repository during automated test runs.
4. **Boundary & Edge Testing:**
   - Always test failure modes: non-existent files, invalid AST syntax, empty Git repos, detached HEAD state, missing commits.

## Testing Taxonomy in ARCHON
- **Unit Tests (`tests/test_*.py`):**
  - AST parsing (`test_ast_parser.py`): Symbol extraction, import resolution, docstring parsing.
  - Evidence collation (`test_evidence.py`): Fact vs inference tagging, citation generation.
  - Blast-radius calculation (`test_impact_analyzer.py`): Transitive caller traversal.
  - Repository scanning (`test_repository.py`): Git history extraction, secret scrubbing.
- **Integration Tests (`tests/test_api_endpoints.py`):**
  - DRF endpoint testing (`/api/v1/investigate/`, `/api/v1/scan/`, `/api/v1/graph/`).
- **Graph Tests (`tests/test_neo4j_graph.py`):**
  - Cypher query formatting, schema creation, in-memory fallback behavior.

## Step-by-Step Procedure
1. **Define Observable Acceptance Criteria:**
   - Write down expected input and expected output before writing code.
2. **Author the Test First (Red):**
   - Write the test asserting the desired behavior. Run `pytest` to confirm it fails as expected.
3. **Implement the Minimal Code (Green):**
   - Write the simplest clean implementation that makes the test pass.
4. **Refactor & Optimize:**
   - Clean up code, remove duplication, and ensure adherence to typing rules.
5. **Run Full Test Suite:**
   - Execute `.\.venv\Scripts\python.exe -m pytest` and check exit code.

## Verification Criteria
- [ ] All tests exit with code 0.
- [ ] No regression introduced into existing 28 baseline tests.
- [ ] Edge cases (invalid paths, missing symbols) have explicit test coverage.

## Expected Deliverables
- Automated test file or new test functions in `tests/`.
- Terminal output log showing passing test count.
