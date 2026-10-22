# ARCHON 2.0 — Migration & Implementation Plan
### Track T1: AI and Developer Tools | Priority: Neo4j Track | hackFront India 2026

---

## Executive Summary
ARCHON is being evolved from a single-process Streamlit prototype into **ARCHON 2.0**: a production-grade, evidence-first engineering intelligence platform. 

The system enables developers to understand **why** legacy or unfamiliar code was designed the way it was, assess the **change impact** of proposed modifications, and visualize **architectural relationships** through a verifiable **Neo4j Knowledge Graph & GraphRAG pipeline**.

---

## Migration Philosophy: Safe Dual-Engine Progression

```
+--------------------------------------------------------------------------+
|                            STABLE MILESTONE 1                            |
|  - Streamlit Dashboard (app.py on :8501)                                 |
|  - Verified archon/ repository, evidence & investigator modules          |
|  - 17 Passing Pytest Tests                                               |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
|                           ARCHON 2.0 PLATFORM                            |
|                                                                          |
|  +-------------------------+            +------------------------------+  |
|  |     Next.js Web UI      | <---JSON-- |  Django REST API (:8000)     |  |
|  | (React Flow, Tailwind,  |            |  - Repository Service        |  |
|  |  Lucide, Dark Slate)    |            |  - Neo4j GraphRAG Service    |  |
|  +-------------------------+            |  - Change Impact Engine      |  |
|                                         |  - Evaluation Framework      |  |
|                                         +--------------+---------------+  |
|                                                        │                 |
|                                                        ▼                 |
|                                         +------------------------------+  |
|                                         |  Neo4j Knowledge Graph       |  |
|                                         |  - File, Symbol, Commit, Test|  |
|                                         |  - CALLS, IMPORTS, TESTS     |  |
|                                         +------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## Step-by-Step Staged Execution

### Stage A: Foundation & Dual-Stack Setup
- [x] Audit existing Milestone 1 codebase and test suite (17 passed).
- [x] Install backend requirements: `django`, `djangorestframework`, `django-cors-headers`, `neo4j`, `pydantic`.
- [ ] Initialize Django project (`server/` or `archon_api/`) with SQLite DB, CORS, and health endpoints.
- [ ] Initialize Next.js 14/15 App Router application (`web/`) with Tailwind CSS, TypeScript, and Lucide icons.
- [ ] Verify both servers run locally on Windows (Django on `:8000`, Next.js on `:3000`).

### Stage B: Real Repository Intelligence API & AST Analysis
- [ ] Connect existing `archon.repository` and `archon.investigator` into reusable Django domain services.
- [ ] Add deep Python AST extractor: parse function definitions, classes, method calls, imports, docstrings, and decorator contracts.
- [ ] Implement API endpoints:
  - `POST /api/v1/repositories/validate/`
  - `POST /api/v1/repositories/index/`
  - `GET /api/v1/repositories/symbols/`
  - `POST /api/v1/investigations/`
  - `GET /api/v1/investigations/<id>/`
- [ ] Verify investigations against demo datasets and local repositories (such as BAHub).

### Stage C: Neo4j Knowledge Graph & GraphRAG
- [ ] Implement `archon/neo4j_graph.py` service using the official Python Neo4j driver:
  - Idempotent schema: Unique constraints on `Repository(id)`, `File(path)`, `Symbol(id)`, `Commit(hash)`, `Test(id)`.
  - Relationships: `(:Repository)-[:CONTAINS]->(:File)`, `(:File)-[:DEFINES]->(:Symbol)`, `(:Symbol)-[:CALLS]->(:Symbol)`, `(:File)-[:IMPORTS]->(:File)`, `(:Commit)-[:MODIFIES]->(:Symbol)`, `(:Test)-[:TESTS]->(:Symbol)`.
  - Bounded parameterized Cypher queries for callers, tests, and commit archaeology.
  - Honest status handling: If Neo4j is offline or disconnected, system reports clear fallback status without fabricating graph data.
- [ ] Expose `GET /api/v1/repositories/graph/` returning node/edge payloads formatted for React Flow.

### Stage D: Change Impact Intelligence & Next.js Workspaces
- [ ] Implement Change Impact Engine:
  - User submits proposed change to a symbol.
  - Engine determines direct callers, downstream imports, affected test suites, and blast radius.
- [ ] Build Next.js Pages:
  1. **Engineering Command Center** (Repo status, quick stats, telemetry).
  2. **Repository Explorer** (File tree, symbol catalogue, AST contracts).
  3. **Investigation Workspace** (3-panel: Left repo/symbol picker, Center timeline & explanation, Right evidence inspector).
  4. **Interactive Architecture Graph** (React Flow canvas visualizing Neo4j relationships).
  5. **Change Impact Analyzer** (Advisory impact report).
  6. **Evaluation & History** (Evaluation metrics, investigation trace).

### Stage E: Verification, Evaluation Benchmark & Submission Artifacts
- [ ] Run full test suites: pytest unit tests, DRF API integration tests, and frontend build check.
- [ ] Create benchmark evaluation dataset measuring precision, citation validity, and latency.
- [ ] Finalize documentation and demonstration scripts.
