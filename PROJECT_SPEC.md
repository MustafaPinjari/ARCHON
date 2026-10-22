# ARCHON 2.0 — Functional & Technical Specification
### HackFront India 2026 | Track T1: AI and Developer Tools | Priority: Neo4j Track

---

## 1. Product Mission & Value Proposition
ARCHON (The Engineering Memory Engine) reconstructs the hidden rationale, architectural constraints, and blast-radius consequences behind code decisions by synthesizing 4 empirical evidence pillars into an idempotent Neo4j Knowledge Graph:
1. **Temporal Intent**: Git commits, pickaxe diffs, author attribution, and commit message intents.
2. **Architectural Contract**: Class/function definitions, AST type signatures, docstrings, and invariants.
3. **Verification Mesh**: Unit and integration test assertions guarding against regressions.
4. **Structural Blast Radius**: Call hierarchies, import dependencies, and reverse caller maps.

---

## 2. Neo4j Graph Schema

```
(:Repository {id, name, path, branch, indexed_at})
       │
   [CONTAINS]
       │
       ▼
    (:File {path, relative_path, language, size_bytes, is_test})
       │
   [DEFINES]
       │
       ▼
   (:Symbol {id, name, kind, line_number, docstring, signature})
       │                     ▲
    [CALLS]                  │
       └─────────────────────┘
       │
   [DEPENDS_ON]
       │
       ▼
   (:Symbol / :File)

    (:Commit {hash, author, date, message})
       │
   [MODIFIES]
       │
       ▼
   (:Symbol) / (:File)

    (:Test {id, name, file_path, line_number})
       │
    [TESTS]
       │
       ▼
   (:Symbol)
```

### Constraints & Idempotency
- `CONSTRAINT FOR (r:Repository) REQUIRE r.id IS UNIQUE;`
- `CONSTRAINT FOR (f:File) REQUIRE (f.repo_id, f.relative_path) IS UNIQUE;`
- `CONSTRAINT FOR (s:Symbol) REQUIRE s.id IS UNIQUE;`
- `CONSTRAINT FOR (c:Commit) REQUIRE (c.repo_id, c.hash) IS UNIQUE;`
- `CONSTRAINT FOR (t:Test) REQUIRE t.id IS UNIQUE;`

All ingestion queries use `MERGE` statements with parameterized properties to guarantee that re-indexing a repository is completely idempotent and never duplicates nodes or edges.

---

## 3. Versioned REST API Specification (`/api/v1/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health/` | Service health, Neo4j connectivity, and environment status |
| `POST` | `/api/v1/repositories/validate/` | Validates local directory safety, bounds, and Git status |
| `POST` | `/api/v1/repositories/index/` | Runs AST extraction & idempotent Neo4j graph ingestion |
| `GET` | `/api/v1/repositories/symbols/` | Returns symbol catalog with file paths and line numbers |
| `POST` | `/api/v1/investigations/` | Executes an evidence-backed engineering memory investigation |
| `GET` | `/api/v1/investigations/<id>/` | Retrieves past investigation report and evidence receipts |
| `GET` | `/api/v1/investigations/<id>/evidence/` | Detailed evidence cards with verified lines and diffs |
| `GET` | `/api/v1/repositories/graph/` | Graph data formatted as `{nodes: [...], edges: [...]}` for React Flow |
| `POST` | `/api/v1/impact-analysis/` | Change-impact analysis evaluating blast radius and test risks |
| `GET` | `/api/v1/evaluation/` | Returns evaluation benchmark results (precision, citation rate) |

---

## 4. Evidence-First GraphRAG Pipeline

```
Developer Query ("Why does charge_with_idempotency_key exist?")
                         │
                         ▼
             [Symbol Extraction & Intent]
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
[Git Pickaxe & Commit Search]    [Neo4j Cypher Traversal]
         │                               │
         └───────────────┬───────────────┘
                         ▼
             [Bounded Evidence Package]
           (Verified receipts with line bounds)
                         │
                         ▼
        [Deterministic / LLM Synthesis Engine]
           (Validates citations against facts)
                         │
                         ▼
       [Traceable Structured Investigation Report]
```

---

## 5. Security & Privacy Bounds
- **Zero Code Execution**: Analyzed repositories are never imported or run.
- **Strict Path Validation**: Traversal attacks (`../`) and system roots are rejected.
- **Secret Scrubber**: AWS keys, GitHub tokens, passwords, and `.env` files are automatically redacted.
- **Local-First Boundary**: Runs 100% offline without external telemetry or mandatory paid cloud services.
