# ARCHON Evidence Model Specification

## The 4 Pillars of Engineering Memory

ARCHON does not provide answers without verifiable receipts. Every claim returned by the engine is tied to a specific evidence object under one of the 4 pillars.

---

### Pillar 1: Temporal Intent (Git Archaeology)
- **Objective**: Explain *when* and *by whom* code was modified, and *what problem* the author intended to solve.
- **Evidence Fields**:
  - `commit_hash`: Short and full Git SHA.
  - `author`: Name and email.
  - `timestamp`: ISO-8601 date of commit.
  - `message`: Commit title and extended description.
  - `diff_summary`: Files changed, insertions, and deletions.
  - `intent_tags`: Identified intent tags (`fix`, `feat`, `security`, `perf`, `hotfix`).

### Pillar 2: Architectural Contract (Source Invariants)
- **Objective**: Identify explicitly documented constraints, trade-offs, and invariants in the codebase.
- **Evidence Fields**:
  - `file_path`: Relative path to source file.
  - `symbol_name`: Class, method, or module name.
  - `line_range`: (Start line, End line).
  - `docstring`: Documented contract.
  - `inline_warnings`: Explicit developer comments (e.g. `TODO`, `NOTE`, `FIXME`, `HACK`).

### Pillar 3: Verification Mesh (Test Guardians)
- **Objective**: Discover tests asserting why this behavior was preserved.
- **Evidence Fields**:
  - `test_file`: Path to test suite.
  - `test_name`: Name of the test function.
  - `asserts_behavior`: Explanation of the edge case guarded by this test.
  - `test_type`: Unit, integration, regression, or fuzz test.

### Pillar 4: Structural Blast Radius (Dependency Graph)
- **Objective**: Map which other components rely on this behavior.
- **Evidence Fields**:
  - `dependent_file`: Caller file path.
  - `import_statement`: Exact import or call statement.
  - `usage_context`: Brief snippet showing how the symbol is used.
  - `criticality`: Low, Medium, or High blast radius.
