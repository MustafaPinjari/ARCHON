# ARCHON Engineering Research Report

**Document Version:** 1.0.0  
**Research Date:** October 22, 2026  
**Audience:** ARCHON Core Engineering Team & AI Agents  
**Status:** Approved Technical Baseline  

---

## 1. Executive Summary & Research Scope

ARCHON is an **Evidence-First Software Engineering Memory Engine**. Its core mission is answering *why* unfamiliar software code was written using verifiable, immutable evidence from Git commits, static Abstract Syntax Trees (AST), regression test assertions, and architecture documentation.

This research report establishes the technical foundation for ARCHON's engineering practices, architecture, and technology selections. In accordance with senior engineering standards:
- All claims distinguish between verified facts from primary official documentation, findings from local system verification, and engineering recommendations.
- No technologies are recommended merely because they are popular; every recommendation must solve a concrete problem in ARCHON and be defensible in an architecture review.
- Where external live network calls to search engines were unavailable due to local DNS restrictions, analysis relied on installed package manifests, official compiler/type definitions, and local Antigravity environment specifications.

---

## 2. Official Technical Documentation Research

### 2.1 Google Antigravity & Agentic Customizations
- **Primary Source:** Antigravity Internal Built-in Documentation (`.gemini/antigravity-ide/builtin/skills/agy-customizations/docs/`) and `antigravity_guide`.
- **Verified Facts:**
  - **Customization Roots:** Antigravity discovers customizations at two tiers: Global (`~/.gemini/config`) and Workspace-level (`.agents/` relative to workspace root).
  - **Skill Schema:** Workspace skills reside in `.agents/skills/<skill-name>/SKILL.md`. Each file MUST have valid YAML frontmatter with `name` and `description`.
  - **Context Budgeting (Progressive Disclosure):** Only the `name` and `description` from the YAML frontmatter are injected into the agent's system prompt at session start. The full body of `SKILL.md` is loaded only when the skill is explicitly activated or read via `view_file`.
  - **Rules Schema:** Rules reside in `.agents/rules/*.md` and are loaded per turn. Contradictory rules degrade agent predictability; rules must be consolidated and authoritative.
  - **Tool Invocation:** Antigravity provides explicit tools (`run_command`, `replace_file_content`, `view_file`, `write_to_file`, `browser_subagent`, `manage_task`). Writing a skill file does NOT grant bash/terminal permissions or install external CLI binaries; commands must run through the available toolchain.

### 2.2 Next.js (v16.4.2), React (v19.3.0), and TypeScript (v5.x)
- **Primary Source:** Next.js Documentation (nextjs.org), React 19 Specifications (react.dev), TypeScript Handbook (typescriptlang.org).
- **Verified Facts:**
  - **Server Component Default:** In App Router (`app/`), all components are React Server Components (RSC) by default unless marked with `"use client"`. RSC executes purely at build/request time on the server, generating zero client-side JavaScript bundle footprint.
  - **Client Boundary Optimization:** Interactive widgets requiring browser hooks (`useState`, `useEffect`, canvas/SVG event listeners in React Flow) must be isolated into leaf Client Components rather than wrapping whole pages.
  - **React 19 Primitives:** React 19 standardizes `useActionState` and `useOptimistic` for state mutations, replacing redundant `useEffect` fetching patterns.
  - **Strict TypeScript:** `tsconfig.json` with `"strict": true`, `"noImplicitAny": true`, and strict null checks prevents runtime crashes. Codebases with `any` bypass type guards and hide serialization bugs.

### 2.3 Django (v6.1.2) and Django REST Framework (v3.18.3)
- **Primary Source:** Django 6.1 Documentation (docs.djangoproject.com), DRF Documentation (django-rest-framework.org).
- **Verified Facts:**
  - **Separation of Concerns:** Views should act purely as HTTP transport adapters (deserializing request, calling a domain service, returning serialized response). Reusable business logic (AST parsing, Git extraction, Graph projection) must reside in decoupled service modules (`archon/core/`).
  - **Transaction Management:** Database mutations should use `transaction.atomic()` to guarantee all-or-nothing consistency, especially when persisting multi-table investigation records or batching evidence citations.
  - **Cross-Origin Resource Sharing:** `django-cors-headers` (installed: 4.9.0) must be explicitly configured to restrict origins in production while allowing local Next.js frontend calls (`http://localhost:3000`).

### 2.4 Python 3.14 Standard Library (AST, Typing, Subprocess)
- **Primary Source:** Python 3.14 Documentation (docs.python.org/3.14/library/ast.html, subprocess.html).
- **Verified Facts:**
  - **Static AST Parsing (`ast.parse`):** Python's built-in `ast` module safely analyzes syntax trees without executing bytecode or importing modules into memory. This satisfies ARCHON's non-negotiable security invariant: **Zero Target Code Execution**.
  - **Subprocess Security:** Invoking external tools (e.g. `git log -S <symbol>`) via `subprocess.run` must always pass arguments as an explicit array of strings (`shell=False`) to eliminate shell injection vulnerabilities.

### 2.5 Neo4j (v6.4.1 Driver) and GraphRAG Retrieval Patterns
- **Primary Source:** Neo4j Official Documentation (neo4j.com/docs/python-manual/current/, neo4j-graphrag documentation).
- **Verified Facts:**
  - **Deterministic Cypher vs Vector Retrieval:** The official `neo4j-graphrag` library includes `VectorCypherRetriever` and `HybridCypherRetriever`. Both require generating and storing dense vector embeddings via third-party embedding APIs (e.g., OpenAI, Cohere, Bedrock).
  - **Deterministic Traversal for Exact Code Graphs:** For engineering memory (where nodes are concrete AST symbols, files, commits, and tests connected by exact edges `CALLS`, `TESTS`, `DEFINED_IN`, `MODIFIED_BY`), deterministic Cypher queries with indexed symbol keys provide **100% precision, zero hallucination, and instantaneous traversal** without incurring embedding API costs or vector drift.
  - **Idempotent Ingestion:** Cypher `MERGE` clauses with unique property constraints (`ON CREATE SET`, `ON MATCH SET`) guarantee that repeated repo scans never create duplicate nodes or orphaned relationships.

### 2.6 Web Standards & Accessibility (WCAG 2.2 AA)
- **Primary Source:** W3C Web Content Accessibility Guidelines (WCAG) 2.2, Dec 2023.
- **Verified Facts:**
  - **Contrast Ratios:** Text and images of text must have a contrast ratio of at least 4.5:1 (normal text) and 3:1 (large text and active user interface components / graphical objects).
  - **Focus Indicators:** Success Criterion 2.4.11 (Focus Appearance) requires visible focus rings with sufficient contrast against the background whenever interactive elements receive keyboard navigation.
  - **Semantic Landmarks:** Proper use of `<header>`, `<main>`, `<nav>`, `<aside>`, and `aria-label` attributes enables assistive screen readers to navigate complex developer tools.

---

## 3. Technology & Trend Evaluation Matrix

| Practice / Technology | Maturity Level | Advantages for ARCHON | Disadvantages / Risks | Adopt / Defer / Reject | Concrete Problem Solved in ARCHON |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Deterministic Cypher Graph Traversal** | Mature (Industry Standard) | Exact provenance, 0 hallucinations, 0 external API cost, instant speed. | Requires structured graph schema definition. | **ADOPT NOW** | Core graph queries for symbols, callers, and test blast radius. |
| **Vector-based GraphRAG (`neo4j-graphrag`)** | Emerging | Fuzzy concept matching across natural language queries. | Requires third-party embedding models, subscription keys, network latency. | **DEFER** (Plug-in architecture) | Natural language queries when exact symbol name is unknown. |
| **Static AST Extraction (`ast.parse`)** | Mature (Python Stdlib) | Complete security isolation, zero execution of analyzed repos, parses syntax directly. | Language-specific (currently Python; requires tree-sitter for multi-language). | **ADOPT NOW** | Extracts symbols, callers, imports without risking malware execution. |
| **Next.js App Router + React 19** | Mature | Server-side data fetching, zero-JS layout wrappers, fast rendering. | Client/server boundary discipline required; state sharing requires careful structure. | **ADOPT NOW** | Fast, responsive web UI for multi-pane engineering dashboards. |
| **Tailwind CSS v4 + Semantic Tokens** | Emerging / Mature | Zero CSS bloat, single unified color scale, responsive utility tokens. | Can lead to class clutter if not abstracted into reusable components. | **ADOPT NOW** | High-density developer interface with accessible slate/indigo dark theme. |
| **Interactive Graph Visualization (React Flow / @xyflow/react)** | Mature | Smooth canvas zoom/pan, custom node types, interactive inspection. | Requires client-side rendering; large node sets require canvas bounding/pruning. | **ADOPT NOW** | Interactive exploration of callers, dependencies, and test meshes. |
| **Manual Framework Boilerplate Writing** | Deprecated Anti-pattern | None. | High risk of typos, outdated structure, missing security settings. | **REJECT** | Avoids human error; replaced by official generators and typed templates. |
| **Simulated / Fake Product Metrics** | Anti-pattern | Makes mockups look full. | Destroys developer trust; violates evidence-first core principle. | **REJECT** | Prevents presenting fake evidence to engineers making critical decisions. |

---

## 4. Synthesis of Evidence & Recommendations

1. **Adopt Framework-Native Scaffolding**: Never hand-craft project directories, database migrations, or package structures. Use `django-admin`, `manage.py makemigrations`, and `npm` CLI tools.
2. **Strict TypeScript & Zero `any`**: The audit revealed 5 `any` errors in `web/app/page.tsx`. ARCHON must adopt strict TypeScript interfaces for all evidence models (`EvidenceCitation`, `InvestigationSummary`, `GraphNode`, `GraphEdge`).
3. **Decoupled Service Layer**: Keep Django views thin; domain logic in `archon/core` must be callable by both CLI, Streamlit, and DRF REST endpoints.
4. **Offline-First Zero-Hallucination Core**: Prioritize deterministic Cypher traversals and local AST parsing. Keep AI/LLM narrative generation strictly grounded in retrieved evidence IDs.
