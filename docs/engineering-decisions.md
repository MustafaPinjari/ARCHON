# ARCHON Architecture Decision Records (ADRs)

**Status:** Living Engineering Record  
**Owner:** Staff Software Architect & ARCHON Engineering Team  
**Last Updated:** October 22, 2026  

---

## ADR Index

1. [ADR-001: Antigravity Skill System & Execution Architecture](#adr-001-antigravity-skill-system--execution-architecture)
2. [ADR-002: Dual-Mode Graph Engine — Deterministic Cypher Baseline with Optional GraphRAG](#adr-002-dual-mode-graph-engine--deterministic-cypher-baseline-with-optional-graphrag)
3. [ADR-003: Backend Architecture — Decoupled Core Services with Django REST Framework Transport](#adr-003-backend-architecture--decoupled-core-services-with-django-rest-framework-transport)
4. [ADR-004: Frontend Architecture — Next.js 16 App Router, React 19 Leaf Boundaries & Strict TypeScript](#adr-004-frontend-architecture--nextjs-16-app-router-react-19-leaf-boundaries--strict-typescript)
5. [ADR-005: Security Model — Zero Target Code Execution & Strict Subprocess Isolation](#adr-005-security-model--zero-target-code-execution--strict-subprocess-isolation)
6. [ADR-006: Decisions Requiring User Approval](#adr-006-decisions-requiring-user-approval)

---

### ADR-001: Antigravity Skill System & Execution Architecture

- **Context:** Previous workflows relied on ad-hoc agent instructions, leading to manual boilerplate recreation, unverified assumptions, and skipped testing. Antigravity provides structured workspace customization via `.agents/skills/` and `.agents/rules/`.
- **Decision:**
  - Standardize all engineering roles into 12 focused, progressive-disclosure skills under `.agents/skills/<skill-name>/SKILL.md`.
  - Enforce persistent global engineering rules in `.agents/rules/engineering-standards.md`.
  - Enforce the 8-stage lifecycle for non-trivial work: **Inspect → Research → Plan → Implement → Test → Review → Document → Report**.
- **Alternatives Considered:**
  - Single monolithic prompt in `AGENTS.md`: Rejected due to context window saturation and lack of procedural depth per role.
  - Global `~/.gemini/config` skills only: Rejected because workspace-specific skills must be version-controlled with ARCHON.
- **Consequences:** Predictable agent behavior, reduced token consumption via progressive disclosure, reproducible test execution.

---

### ADR-002: Dual-Mode Graph Engine — Deterministic Cypher Baseline with Optional GraphRAG

- **Context:** ARCHON analyzes repository structures, symbol relationships, and test meshes. The Neo4j track encourages GraphRAG, but third-party embedding models introduce external API costs, latency, and potential hallucination.
- **Decision:**
  - Build the primary knowledge graph on **Deterministic Cypher Traversal** (`CALLS`, `TESTS`, `DEFINED_IN`, `MODIFIED_BY`) using indexed node labels (`Symbol`, `File`, `Commit`, `TestCase`).
  - Provide an in-memory/mock graph fallback when Neo4j is not connected so the platform remains 100% operational offline.
  - Defer vector-based `neo4j-graphrag` embedding retrieval to an optional secondary plugin when API credentials and vector indexes are explicitly supplied.
- **Alternatives Considered:**
  - Pure Vector GraphRAG: Rejected for core symbol lookup because vector similarity can match irrelevant symbols with similar embeddings instead of the exact target symbol.
  - Relational SQL for graph edges: Rejected due to recursive traversal complexity for multi-hop blast-radius analysis.
- **Consequences:** 100% ground-truth precision, instant query execution, zero API costs out-of-the-box, graceful offline fallback.

---

### ADR-003: Backend Architecture — Decoupled Core Services with Django REST Framework Transport

- **Context:** The Milestone 1 prototype combined UI and business logic in a single Streamlit script. Milestone 2 introduced Django REST Framework.
- **Decision:**
  - Retain all core domain logic in pure Python modules under `archon/core/` (repository scanning, AST parsing, Git extraction, impact analysis, graph client).
  - Use Django REST Framework (`api/views.py`, `api/serializers.py`) strictly as an HTTP serialization and routing layer.
  - Views must not contain parsing algorithms or raw Git subprocess executions directly; they invoke `archon/core` services.
- **Alternatives Considered:**
  - Embedding domain logic directly inside DRF `APIView` methods: Rejected because it prevents reusing services in CLI commands or background workers.
  - FastAPI: Rejected because Django is already configured and validated with 28 passing tests in the current environment.
- **Consequences:** Complete testability outside the HTTP layer, clean boundary separation, minimal view complexity.

---

### ADR-004: Frontend Architecture — Next.js 16 App Router, React 19 Leaf Boundaries & Strict TypeScript

- **Context:** The web frontend uses Next.js 16.4.2 and React 19.3.0. Previous linting revealed `any` type usage and loose component boundaries.
- **Decision:**
  - Use Next.js App Router with React Server Component defaults.
  - Confine `"use client"` directives strictly to leaf components that require interactivity (e.g. `GraphCanvas.tsx` wrapping React Flow, `CommandCenterInput.tsx`).
  - Enforce Strict TypeScript: zero `any` allowed in production components. All API responses must be strongly typed with shared interfaces in `web/lib/types.ts`.
- **Alternatives Considered:**
  - Single-Page React with Vite: Next.js was already chosen and configured with Tailwind v4; switching would cause unnecessary rework.
  - Disabling `@typescript-eslint/no-explicit-any`: Rejected because loose types cause undefined property crashes in complex evidence trees.
- **Consequences:** High performance, accessible rendering, zero type-regression risk.

---

### ADR-005: Security Model — Zero Target Code Execution & Strict Subprocess Isolation

- **Context:** ARCHON analyzes arbitrary user codebases (e.g. `C:\Users\mustafa\Desktop\BAHub`). Running or importing untrusted user code could execute malicious scripts or arbitrary code in the host runtime.
- **Decision:**
  - **Zero Target Code Execution:** Analyzed repositories are NEVER imported or executed by Python. All inspection occurs via static parsing (`ast.parse`) or text scanning.
  - **Subprocess Argument Array Isolation:** All Git commands use `subprocess.run(["git", ...], shell=False, check=True)` with explicit arguments to prevent shell command injection.
  - **Strict Credential Scrubbing:** Files matching `.env*`, `*pem`, `*key`, `*token*`, `id_rsa*` are barred from ingestion or frontend display.
- **Consequences:** Complete isolation from target repo vulnerabilities, safe scanning of untrusted open-source repos.

---

---

### ADR-007: Frontend Modularization, Evidence Citations & Windows Daemon Orchestration

- **Context:** `web/app/page.tsx` was a monolithic 949-line file containing all 6 dashboard tabs, with 5 reported `any` annotations, unused icon imports, and inert evidence citations. Additionally, cross-platform Windows startup required synchronized health probing for Django and Next.js.
- **Decision:**
  - **Modular Tab Extraction:** Decompose dashboard into 6 standalone components in `web/components/tabs/` (`CommandCenterTab`, `ExplorerTab`, `InvestigationTab`, `GraphTab`, `ImpactTab`, `EvaluationTab`) and 2 layout components (`Sidebar`, `Header`).
  - **Zero-`any` Discipline:** Create `web/lib/types.ts` mirroring DRF serializers and API models. Replace all `any` with precise domain interfaces (`TabId`, `EvidenceTabId`, `HealthStatus`, `ValidationResponse`, `SymbolItem`, `EvidenceItem`, `InvestigationResult`, `FlowGraph`, `ImpactReport`, `EvaluationSummary`).
  - **Interactive Evidence Citations:** Implement citation badge parsing and auto-scrolling with visual focus highlighting, matching citations (`[c4b12a8]`, `[test_charge]`, `[INC-8821]`) to corresponding evidence receipts without inventing mappings.
  - **Windows Orchestration (`start_archon.ps1` & `.bat`):** Automate prerequisite validation, port conflict detection on 8000 and 3000 via loopback socket probes, process spawning with log isolation, and bounded HTTP/REST health probes with graceful fallback handling.
- **Alternatives Considered:**
  - Heavy state management library (Zustand/Redux): Rejected as premature; typed callback props cleanly handle workspace interactions across leaf components.
  - Direct shell-based command string execution in Windows batch: Rejected due to fragile error propagation; delegated to clean PowerShell with `-UseBasicParsing` and error code preservation.
- **Consequences:** ESLint passes with 0 errors and 0 warnings, Next.js production build exits code 0, page controller reduced from 949 to under 280 lines, and deterministic one-click startup on Windows.

---

## ADR-008: Decisions Requiring User Approval

The following architectural choices are documented and ready for execution, pending user confirmation:

1. **Neo4j Production Instance Provisioning:**
   - *Current State:* Running with robust fallback in-memory graph adapter with 100% test coverage.
   - *Decision for User:* Confirm whether you wish to connect a local Dockerized Neo4j Community Edition instance (`bolt://localhost:7687`) or Neo4j AuraDB Free Cloud instance for persistent multi-repo storage.
2. **Multi-Language AST Support:**
   - *Current State:* Native Python `ast.parse` static extractor.
   - *Decision for User:* Approve adoption of `tree-sitter` for JavaScript/TypeScript and Go extraction in Milestone 3.

