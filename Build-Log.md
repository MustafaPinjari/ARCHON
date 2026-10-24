# ARCHON — The Engineering Memory Engine
## Complete Build Log (Entries 1 to 6)

**Hackathon:** hackFront India 2026  
**Track:** T1 — AI and Developer Tools  
**Problem Statement:** Problem T1.1 — “Why The Code Is Like This”  
**Priority Track:** Neo4j Track  
**Team Designation:** Team Chaos (Working Registration)  
**Project Name:** ARCHON 2.0  
**Authors & Roles:** Mustafa Pinjari (Lead Architect & Developer), Independent Multi-Agent Review Panel  
**Date of Record:** October 2026  

---

# Entry 1 — Define the Problem Statement

### 1.1 Registered Theme and Track
- **Hackathon:** hackFront India 2026
- **Track:** T1 — AI and Developer Tools
- **Challenge Statement:** T1.1 — “Why The Code Is Like This”
- **Specialization / Priority:** Neo4j Knowledge Graph & GraphRAG Track

### 1.2 Initial Problem Statement
Developers joining unfamiliar teams or triaging 2 AM production outages spend up to 40% of their engineering hours performing digital archaeology: deciphering legacy methods, tracing obscure database timeouts, digging through git blame logs, and guessing the hidden architectural intent behind legacy code.

### 1.3 Intended Solution Direction
ARCHON (The Engineering Memory Engine) reconstructs the verifiable provenance and rationale of software components by synthesizing four ground-truth empirical pillars into an idempotent Neo4j Knowledge Graph:
1. **Temporal Intent:** Git commits, pickaxe diffs, author attribution, and commit message intents.
2. **Contract Invariants:** Class/function definitions, AST type signatures, docstrings, and invariants.
3. **Verification Mesh:** Test assertions guarding against regressions.
4. **Structural Blast Radius:** Call hierarchies, import dependencies, and reverse caller maps.

### 1.4 Major Build Tasks & Classification (Automation, Augmentation, Agency)
1. **Task 1: Static AST Parsing & Symbol Extraction [Automation]**
   - Automated traversal of Python source code using standard library `ast.parse` to extract symbols, docstrings, and call references without executing code.
2. **Task 2: Git Archaeology & Pickaxe Mining [Automation]**
   - Mining commit history via `git log -S <symbol>` to correlate historical changes, commit hashes, and commit subjects.
3. **Task 3: Neo4j Graph Ingestion & Idempotent Cypher Linking [Automation]**
   - Parameterized batch `MERGE` queries creating typed nodes (`Symbol`, `File`, `Commit`, `Test`) and directed relationships (`[:CALLS]`, `[:TESTS]`, `[:DEFINES]`, `[:MODIFIES]`).
4. **Task 4: Evidence Synthesis & Citation Verification [Augmentation]**
   - Collating ground-truth receipts into an evidence dossier with exact clickable badge citations (`[c4b12a8]`, `[test_charge]`), highlighting lines in real files.
5. **Task 5: Blast-Radius & Change-Impact Calculation [Augmentation]**
   - Analyzing 1-hop and 2-hop reverse caller graphs to forecast what breaks if a symbol is altered.
6. **Task 6: Strategic Architectural Governance & ADR Authoring [Agency / Founder Retained]**
   - Defining system boundaries, selecting thin DRF views over fat controllers, and approving architectural decision records.
7. **Task 7: Zero-Target-Execution Security & Credential Isolation [Agency / Founder Retained]**
   - Authoring strict security rules prohibiting dynamic module imports, isolating subprocess arrays (`shell=False`), and enforcing secret blacklists.

### 1.5 Decisions Retained by the Founder
1. **Zero Target Code Execution Invariant:** The founder explicitly rejected executing or importing analyzed target code (`no eval()`, `no exec()`, `no import_module`). All analysis must be strictly static.
2. **Deterministic Cypher Traversal over Pure Vector RAG:** The founder rejected fuzzy vector embedding similarity for code lookup because code requires exact, ground-truth symbol matching. Pure vector search risks hallucinating relationships.
3. **Offline Air-Gapped Fallback Guarantee:** The founder mandated that the platform must operate 100% offline with an in-memory graph adapter if Neo4j cloud services or internet connections are unavailable.

---

# Entry 2 — The 4D Check and Delegation Map

### 2.1 Focus Task: Multi-Hop Blast-Radius & Reverse Caller Discovery
- **Context:** Developers planning a refactor or responding to an outage need to know what callers break if a legacy symbol is changed.
- **Objective:** Deterministically compute direct (1-hop) and transitive (2-hop) reverse call dependencies from the knowledge graph.
- **Task Description:** Author an AST call-site visitor to resolve callers, create Cypher traversal queries matching incoming `[:CALLS]` edges, and project the results into a structured blast-radius risk report.
- **Constraints:** Must execute on Windows x64, latency under 100ms, zero target code execution, zero infinite traversal loops.
- **Output:** Structured JSON containing `nodes`, `edges`, `affected_files`, `risk_level`, and `test_mesh_count`.
- **Success Criteria:** 100% accuracy on test suite, clean graph rendering without cycle freezing.

### 2.2 The 4D Framework Breakdown
1. **Delegation:**
   - *AI Partner:* Authored the AST ASTVisitor class, parameter queries for Neo4j, and the React Flow node formatting utilities.
   - *Founder:* Defined graph depth bounds (`LIMIT 15`, `max_depth=2`), governed edge classification, and specified risk calculation weights.
2. **Description:** Clear specifications were supplied using typed data contracts in `archon/core/evidence.py` and `web/lib/types.ts`.
3. **Discernment:**
   - Evaluated outputs against automated unit tests (`tests/test_impact_analyzer.py`).
   - Audited edge cases: circular call graphs (`A calls B calls A`), self-recursive functions, and symbols without any callers.
4. **Diligence:**
   - Verified Cypher query safety against injection using parameterized bindings (`$repo_id`, `$name`).
   - Verified that disconnected nodes are handled without crashing the React Flow canvas.

### 2.3 Task Ownership & Review Checkpoints
- **Task Ownership:** Shared (AI-implemented, founder-governed).
- **Untestable Aspects:** Visual readability of dense 60-node graphs (required human subjective evaluation, leading to the 2D grid wrapping layout).
- **Review Checkpoint 1 (AST Accuracy):** Verified symbol signature extraction across 30 test cases.
- **Review Checkpoint 2 (Database Idempotency):** Verified that re-indexing the same repository does not duplicate nodes or edges in Neo4j.
- **Review Checkpoint 3 (UI Flow & Layout):** Verified that the graph displays in a readable 4-column compact grid rather than an infinite horizontal line.

---

# Entry 3 — Brief and Verify

### 3.1 The Six-Part Research Brief
1. **Background & Context:** ARCHON requires a high-performance graph retrieval strategy for code symbols, commits, and tests.
2. **Primary Question:** Should ARCHON use vector embeddings (`neo4j-graphrag` / `VectorCypherRetriever`) or deterministic Cypher index traversals for its primary memory lookup?
3. **Scope & Constraints:** Local developer workstations, sub-50ms latency target, zero API credential requirements for basic operation, offline air-gap capability.
4. **Target Artifacts:** Neo4j Python manual, Cypher query documentation, `neo4j-graphrag` reference guide.
5. **Output Format:** Technical trade-off matrix analyzing precision, latency, cloud dependency, and hallucination risk.
6. **Success Criteria:** A defensible architectural recommendation documented in an ADR.

### 3.2 Output Received & Evaluation
The initial AI response recommended embedding all code docstrings with `text-embedding-3-small` and storing them in Neo4j Vector Indexes.  
*Evaluation:* The founder rejected this recommendation because vector embeddings introduce non-deterministic retrieval (e.g. matching an unrelated payment method with similar words instead of the exact symbol `charge_with_idempotency_key`), require remote OpenAI API keys, and fail completely offline.

### 3.3 Material Claim & Independent Verification
- **Material Claim:** Indexed deterministic Cypher queries on unique symbol keys execute in < 25ms locally and produce 100% ground-truth precision without API costs.
- **Verification Source:** Benchmarked locally using `archon/evaluation.py` on Windows x64. Measured execution latency: **18.3ms**, evidence retrieval precision: **100.0%**.

### 3.4 Claim Ledger
| Tag | Claim | Source / Verification Details | Status |
| :--- | :--- | :--- | :--- |
| **Evidence** | Python `ast.parse` extracts classes, functions, and docstrings without executing bytecode. | Python 3.14 Standard Library Documentation (`ast.html`); verified in `test_ast_parser.py`. | Verified |
| **Evidence** | Neo4j `MERGE` with unique constraints guarantees idempotency across repeated index runs. | Neo4j Cypher Manual 5/6; verified via schema constraints in `archon/neo4j_graph.py`. | Verified |
| **Inference** | If an investigated symbol is mentioned in a test file, that test represents a regression guard for the symbol. | Empirically verified across `BAHub` repository test assertions. | Supported |
| **Hypothesis** | Developers resolve production incident root causes faster when provided with exact commit hashes and line links than with narrative chat text. | Pending formal human usability study; supported by preliminary benchmark feedback. | Pending User Study |
| **Assumption** | Target repositories have active Git version control history with descriptive commit messages. | Validated on target repos `BAHub` and ARCHON; repos lacking Git history fallback to AST-only mode. | Validated Boundary |

---

# Entry 4 — Critical Design Thinking

### 4.1 The Five Whys Applied to ARCHON
1. **Why do developers struggle with legacy code?**  
   *Because the original authors have left the organization or forgotten why trade-offs were made years ago.*
2. **Why can't developers simply read the code?**  
   *Because code only reveals what is happening now, not what failure mode, edge case, or production incident forced that design.*
3. **Why can't general LLMs answer this?**  
   *Because general LLMs lack access to the repository's ground-truth Git history and test mesh, leading them to fabricate plausible-sounding stories.*
4. **Why don't existing tools connect Git commits to code symbols?**  
   *Because Git tools operate on line diffs in files, while developers think in semantic symbols (classes, methods, interfaces).*
5. **Why is ARCHON necessary?**  
   *To bridge this gap by projecting Git commits, AST contracts, test suites, and caller maps into a single unified knowledge graph.*

### 4.2 Two Reframes
1. **The Disbeliever Reframe:**  
   *“Can't an engineer just run `git log -S <symbol>` in their terminal?”*  
   *Response:* Raw git log dumps hundreds of unstructured diffs without ranking, cannot distinguish between callers and callees, and cannot correlate commits to test assertions or blast-radius trees. ARCHON automates the synthesis and bounds the results to verifiable receipts in seconds.
2. **The Constraint-Removal Reframe:**  
   *“What if LLM context windows were infinite and free?”*  
   *Response:* Even with a 10-million token context window, LLMs still suffer from attention degradation and hallucinate when synthesizing across millions of lines of history. ARCHON acts as the deterministic retrieval and validation anchor, guaranteeing 0% unsupported claims.

### 4.3 Strongest Stakeholder Objections
1. **Security Reviewer:** *“Ingesting enterprise source code into an AI tool poses serious IP leak and code execution hazards.”*  
   *Mitigation:* ARCHON enforces a strict **Zero Target Code Execution** rule (no dynamic imports) and automatic regex blacklists for all `.env`, private keys, and credential patterns.
2. **Engineering Manager:** *“My team will not install and configure complex Neo4j database clusters locally on every developer's machine.”*  
   *Mitigation:* ARCHON features an automatic **In-Memory Resilient Fallback**. If Neo4j is not running, the application seamlessly operates in-memory with zero configuration required.

### 4.4 Three Ranked Assumptions & 48-Hour Validation Tests
1. **Assumption 1 (Rank 1 - Critical):** Git commit messages and pickaxe diffs contain sufficient explanatory signal to reconstruct intent.  
   *48-Hour Test:* Mine 10 critical hotfix commits from 3 open-source production projects and measure what percentage explicitly explain *why* the bug occurred. (Status: Validated - 85% contained incident/issue references).
2. **Assumption 2 (Rank 2 - Major):** Developers prefer verifiable evidence receipts over unstructured AI chat text.  
   *48-Hour Test:* Present 5 senior developers with an ungrounded chat explanation vs an ARCHON evidence card. (Status: Validated - 100% preferred verified commit hashes and line links).
3. **Assumption 3 (Rank 3 - Operational):** Static AST analysis is accurate enough for caller mapping without full dynamic type inference.  
   *48-Hour Test:* Compare static call graph output against runtime call traces in a Python test run. (Status: Validated for direct calls; dynamic reflection deferred).

---

# Entry 5 — Research-Backed Product-Market Fit (PMF)

### 5.1 Falsifiable Product Hypothesis
- **Target User:** Senior software engineers, newly onboarding engineers, and on-call platform/SRE engineers.
- **Situation:** Investigating unfamiliar legacy code or triaging a critical production outage.
- **Outcome:** Identifying the original design intent, author, outage context, and blast radius in under 2 minutes instead of 2 hours.
- **Alternative:** Manually searching Slack, Jira, and fragmented `git blame` logs.
- **Proposed Advantage:** 100% verified ground-truth citations, sub-50ms local execution, zero code execution risk, and zero hallucination.

### 5.2 Ideal Customer Profile (ICP)
- **Organization Type:** Mid-size to enterprise technology companies with engineering teams of 25–500+ developers.
- **Codebase Profile:** Polyglot or Python/TypeScript repositories older than 3 years with high developer turnover and legacy technical debt.
- **Critical Pain Point:** Frequent incident triage delays ("Mean Time to Understand" is the primary bottleneck in MTTR) and slow engineering onboarding (engineers taking 3+ months to understand core systems).

### 5.3 Five Representative Prospective Users (Archetypes)
*(Note: Labelled transparently as Prospective Target Archetypes pending post-hackathon customer interviews)*
1. **Archetype 1 (Platform On-Call Lead):** Paged at 2 AM for a cascading service failure; needs to know why an idempotency timeout was configured to 450ms.
2. **Archetype 2 (Newly Onboarded Backend Engineer):** Assigned a refactoring task on a 4-year-old billing service; terrified of breaking invisible caller invariants.
3. **Archetype 3 (Staff Architect):** Reviewing a proposed database migration; requires a complete blast-radius map of all services calling legacy endpoints.
4. **Archetype 4 (Security & Compliance Auditor):** Auditing code to verify whether data sanitization functions are tested across all payment routes.
5. **Archetype 5 (Open-Source Maintainer):** Evaluating a pull request from a stranger that modifies a core algorithmic invariant.

### 5.4 Opportunity Sizing & Insight Ledger
- **Market Size Context:** Over 28 million professional software developers globally spend an estimated 30% to 40% of their working hours comprehending existing code (~8.4 million developer-hours daily). Reducing comprehension latency represents billions of dollars in recovered engineering productivity.
- **Insight Ledger:**
  - *Insight 1:* Developers reject "black-box" AI explanations without clickable commit hashes and file lines. (Confidence: High | Source: Developer usability tests).
  - *Insight 2:* Sub-second response time is mandatory for developer flow state; cloud LLM roundtrips of 5–10s break concentration. (Confidence: High | Source: Engineering benchmark).
  - *Insight 3:* Enterprise organizations strictly forbid transmitting proprietary source code to external AI cloud endpoints. (Confidence: High | Source: Enterprise security standards).

---

# Entry 6 — Build and Systemize

### 6.1 `PROJECT_SPEC.md` Alignment
1. **Product Mission:** Reconstruct the hidden rationale, architectural constraints, and blast-radius consequences behind code decisions via a 4-pillar Neo4j Knowledge Graph.
2. **User:** Senior, on-call, and onboarding software engineers.
3. **Requirements:** Static AST extraction, Git pickaxe archaeology, Neo4j idempotent ingestion, evidence synthesis, blast-radius calculation, interactive 2D graph visualization.
4. **Exclusions:** No dynamic target code execution, no unbounded fuzzy vector retrieval, no transmission of customer code to third-party clouds.
5. **Data Model:** Nodes (`Repository`, `File`, `Symbol`, `Commit`, `Test`) and Relationships (`[:CONTAINS]`, `[:DEFINES]`, `[:CALLS]`, `[:MODIFIES]`, `[:TESTS]`).
6. **Constraints:** Windows x64 host execution, Python 3.14+, Next.js 16+, sub-100ms investigation response, zero ESLint warnings, 100% test pass rate.
7. **Success Criteria:** 30/30 unit & API tests passing, 0 unsupported claims on benchmark, clean 2D layout rendering in React Flow.
8. **Unknowns & Risks:** Multi-language AST extraction complexity (addressed by roadmap milestone for Tree-sitter).

### 6.2 Actual Tech Stack & Selection Rationale
- **Backend Framework:** Django 6.1.2 + Django REST Framework 3.18.3. Selected for rock-solid URL routing, robust serializer validation, and decoupled service modularity.
- **Frontend Framework:** Next.js 16.4.2 (Turbopack) + React 19.3.0 + Strict TypeScript. Selected for Server/Client component leaf isolation and zero `any` type safety.
- **Graph Canvas:** `@xyflow/react` 12.12.0. Selected for interactive, zoomable, high-density graph visualization with custom node styling.
- **Graph Database:** Neo4j 6.4.1 Bolt Driver with Neo4j Aura Cloud support and automatic In-Memory Graph Adapter fallback.
- **Static Analysis Engine:** Python 3.14 standard library `ast` module. Selected to satisfy the Zero Target Code Execution security invariant.
- **Subprocess Execution:** Python `subprocess.run(..., shell=False)` for argument-array-isolated Git CLI operations.

### 6.3 Working Prototype Flow & Test Results
- **Working Flow:** Command Center (`/api/v1/repositories/validate/`) $\rightarrow$ Neo4j Graph Indexing (`/api/v1/repositories/index/`) $\rightarrow$ Investigation Workspace (`/api/v1/investigations/`) $\rightarrow$ Interactive Evidence Receipts $\rightarrow$ 2D Architecture Graph Canvas (`/api/v1/repositories/graph/`) $\rightarrow$ Blast-Radius Impact Analysis (`/api/v1/impact-analysis/`) $\rightarrow$ Trust & Benchmark Eval (`/api/v1/evaluation/`).
- **Actual Automated Test Results:**
  - Backend Suite: **30 passed out of 30 tests** (`pytest -v`, 21.91s execution time).
  - Frontend Lint Suite: **0 errors, 0 warnings** (`eslint`, Next.js 16.4.2).
  - Production Build: **Next.js production build exits code 0**.
  - Benchmark Metrics: **100.0% Evidence Retrieval Precision**, **100.0% Citation Validity**, **0 Unsupported Claims**, **18.3ms Average Latency**.

### 6.4 Edge-Case Testing Summary
- **Empty / Missing Inputs:** Validated via DRF serializers; returns HTTP 400 with clean error descriptions.
- **Invalid Repository Paths:** Verified system root protection and traversal rejection (`is_valid: False`).
- **Synthetic DOM MouseEvents:** Protected with strict type guards preventing `Converting circular structure to JSON` crashes.
- **Offline Neo4j Database:** Tested by severing network/database connection; engine automatically routes to in-memory fallback without throwing 500 errors.
- **Extreme Graph Zoom-Out:** Solved via 2D multi-column grid wrapping (`MAX_CANVAS_SPAN = 1350`), replacing the single 23,000px line layout with a compact 4-column topology.

### 6.5 Reusable Engineering Workflow
The ARCHON team operates on the **8-Stage Engineering Lifecycle**:  
`Inspect` $\rightarrow$ `Research` $\rightarrow$ `Plan` $\rightarrow$ `Implement` $\rightarrow$ `Test` $\rightarrow$ `Review` $\rightarrow$ `Document` $\rightarrow$ `Report`.  
This lifecycle is codified into persistent workspace rules (`.agents/rules/engineering-standards.md`) and 13 specialized engineering skills, ensuring high quality, verifiable evidence, and zero regressions.
