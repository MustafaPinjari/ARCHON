---
name: neo4j-graphrag-engineering
description: Guides Neo4j graph modeling, Cypher query optimization, idempotent ingestion, bounded traversals, and GraphRAG retrieval patterns.
---

# Neo4j & GraphRAG Engineering Skill

## Purpose
This skill governs graph data modeling, Cypher query construction, and retrieval-augmented generation using Neo4j in ARCHON. It ensures high performance, schema invariants, bounded traversals, and offline resilience.

## Activation Criteria
Activate this skill whenever:
- Designing or updating Neo4j graph schemas, node labels, or relationship types.
- Authoring Cypher queries for symbol investigation, caller detection, or blast-radius calculation.
- Integrating or configuring `neo4j-graphrag` retrieval components.
- Maintaining the in-memory fallback graph adapter (`archon/core/neo4j_graph.py`).

## Required Tools
- `view_file` / `replace_file_content`: Edit graph client and Cypher query templates.
- `run_command`: Run graph tests (`pytest tests/test_neo4j_graph.py`).

## Core Graph Principles in ARCHON
1. **Schema & Node Hierarchy:**
   - `:Symbol`: `{id, name, kind, file_path, line_start, line_end, docstring}`
   - `:File`: `{path, language, loc}`
   - `:Commit`: `{sha, message, author, timestamp}`
   - `:TestCase`: `{id, name, file_path}`
2. **Deterministic Relationships:**
   - `(:Symbol)-[:DEFINED_IN]->(:File)`
   - `(:Symbol)-[:CALLS]->(:Symbol)`
   - `(:TestCase)-[:TESTS]->(:Symbol)`
   - `(:Commit)-[:MODIFIES]->(:Symbol)`
3. **Idempotent Ingestion (`MERGE`):**
   - Always use `MERGE` with unique composite keys (`id` or `sha`) to prevent duplicate nodes on re-scanning:
     ```cypher
     MERGE (s:Symbol {id: $symbol_id})
     ON CREATE SET s.name = $name, s.kind = $kind, s.created_at = timestamp()
     ON MATCH SET s.last_seen = timestamp()
     ```
4. **Parameterized Queries:**
   - Never concatenate variables into Cypher query strings. Always pass parameters via the driver's `$param` dictionary to prevent Cypher injection.
5. **Bounded Traversals:**
   - Never run unbounded relationship traversals (e.g. `(s)-[*]->(c)`). Always specify bounds (e.g. `(s)-[*1..3]->(c)`) to prevent runaway graph queries.
6. **Graceful Offline Fallback:**
   - The application must detect connection failures (`ServiceUnavailable`, `AuthError`) and seamlessly route queries to the local `InMemoryGraphAdapter` without throwing unhandled exceptions.

## Step-by-Step Procedure
1. **Define Schema Invariants & Constraints:**
   - Ensure uniqueness constraints exist on `Symbol.id`, `Commit.sha`, and `File.path`.
2. **Author Parameterized Cypher Query:**
   - Format query with explicit node labels and directional arrows.
3. **Validate in Local / In-Memory Adapter:**
   - Verify that both Neo4j driver and the in-memory fallback yield identical structure.
4. **Test Traversal Limits:**
   - Write tests ensuring circular calls do not result in infinite loops.

## Verification Criteria
- [ ] Queries use parameterized parameters (`$param`).
- [ ] Traversals are bounded (`*1..N`).
- [ ] Both live Neo4j and offline fallback pass `tests/test_neo4j_graph.py`.

## Expected Deliverables
- Cypher query implementations in `archon/core/neo4j_graph.py`.
- Automated tests verifying graph creation and query execution.
