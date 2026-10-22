# ARCHON 2.0 System Architecture

## Overview
**ARCHON (The Engineering Memory Engine)** is an evidence-first software engineering intelligence platform. It recovers the hidden rationale, architectural constraints, and blast-radius consequences behind code decisions by synthesizing 4 empirical evidence pillars into an idempotent **Neo4j Knowledge Graph & GraphRAG pipeline**.

---

## High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 ARCHON 2.0 WEB UI                               |
|                  (Next.js App Router, React, TypeScript, Tailwind)              |
|                                                                                 |
|  [ Command Center ]  [ Repo Explorer ]  [ Investigation Workspace ]  [ React Flow ] |
|  [ Evidence Inspector ]  [ Change Impact Analyzer ]  [ Evaluation & Trace ]     |
+----------------------------------------+----------------------------------------+
                                         │ JSON over HTTP
                                         ▼
+---------------------------------------------------------------------------------+
|                              DJANGO REST FRAMEWORK API                          |
|                               (Django 6, DRF, Pydantic)                         |
|                                                                                 |
|  Endpoints:                                                                     |
|    • /api/v1/health/                     • /api/v1/investigations/              |
|    • /api/v1/repositories/validate/      • /api/v1/repositories/graph/          |
|    • /api/v1/repositories/index/         • /api/v1/impact-analysis/             |
|    • /api/v1/repositories/symbols/       • /api/v1/evaluation/                  |
+-------------------+------------------------------------+------------------------+
                    │                                    │
                    ▼                                    ▼
+--------------------------------------+  +---------------------------------------+
|        DOMAIN SERVICES LAYER         |  |         NEO4J GRAPH SERVICE           |
|                                      |  |  (Official Neo4j Driver & Cypher)     |
|  • RepositoryManager (Safety Bounds) |  |                                       |
|  • AstExtractor (Python AST/Tokens)  |  |  • Repository, File, Symbol, Commit   |
|  • GitArchaeology (Pickaxe, Blame)   |  |  • CALLS, IMPORTS, TESTS, MODIFIES   |
|  • EvidenceSynthesizer (Provenance)  |  |  • Parameterized Cypher Traversals    |
|  • ChangeImpactEngine (Blast Radius) |  |  • Resilient Offline Fallback         |
+-------------------+------------------+  +-------------------+-------------------+
                    │                                         │
                    ▼                                         ▼
+--------------------------------------+  +---------------------------------------+
|          LOCAL REPOSITORIES          |  |         APPLICATION METADATA          |
|  (Static source files & Git repos)   |  |     (SQLite for dev / history)        |
+--------------------------------------+  +---------------------------------------+
```

---

## Core Components

### 1. Next.js Frontend (`web/`)
- **Technology**: Next.js 14/15 App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Interactive Architecture Graph**: Built with **React Flow**, rendering real nodes (`File`, `Symbol`, `Commit`, `Test`) and directed edges (`CALLS`, `TESTS`, `IMPORTS`, `MODIFIES`) retrieved live from Neo4j.
- **3-Panel Investigation Workspace**:
  - *Left Panel*: Repository selector, branch indicator, symbol catalog, and search filters.
  - *Center Panel*: Investigation prompt, step-by-step progress trace, executive synthesis, and timeline.
  - *Right Panel*: Interactive evidence cards, exact line links, Git diff receipts, and audit diagnostics.

### 2. Django REST API (`server/`)
- **Technology**: Django, Django REST Framework, django-cors-headers, Pydantic.
- **Architecture**: Modular monolith with decoupled domain services:
  - `server/api/views.py`: Clean REST endpoints validating payloads via Pydantic/serializers.
  - `archon/repository.py`: File scanner, path-traversal firewall, and secret scrubber.
  - `archon/ast_parser.py`: Python AST analyzer extracting classes, functions, calls, imports, and docstrings.
  - `archon/neo4j_graph.py`: Neo4j driver interface with idempotent Cypher queries.
  - `archon/impact_analyzer.py`: Change-impact advisory engine.
  - `archon/evaluation.py`: Quantitative benchmark tracking precision, citation validity, and latency.

### 3. Neo4j Knowledge Graph & GraphRAG
- **Schema**:
  - `(:Repository)-[:CONTAINS]->(:File)`
  - `(:File)-[:DEFINES]->(:Symbol)`
  - `(:Symbol)-[:CALLS]->(:Symbol)`
  - `(:File)-[:IMPORTS]->(:File)`
  - `(:Commit)-[:MODIFIES]->(:Symbol)`
  - `(:Test)-[:TESTS]->(:Symbol)`
- **GraphRAG Pipeline**:
  - Deterministic Cypher queries traverse incoming/outgoing edges up to 2 hops deep.
  - Graph context is merged with Git pickaxe history and AST contracts into a bounded evidence package.
  - Citations are strictly validated against ground-truth source lines before rendering.
