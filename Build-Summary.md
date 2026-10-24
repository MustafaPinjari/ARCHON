# ARCHON — The Engineering Memory Engine
## Build Summary & Executive Review Brief

**Hackathon Track:** hackFront India 2026 — Track T1: AI and Developer Tools (Problem T1.1: “Why The Code Is Like This”)  
**Team Designation:** Team Chaos (Hackathon Working Registration)  
**Project:** ARCHON 2.0 — The Evidence-First Engineering Memory Engine  
**Reviewer Audience:** Senior Engineering Evaluator & Hackathon Judging Panel  

---

### 1. Final Problem Statement & Evolution

- **Version 1 (Initial):** Software developers waste time deciphering legacy code; an AI chatbot could explain code history and answer developer questions.
- **Why It Changed:** Initial empirical testing showed that general-purpose conversational LLMs (e.g. ChatGPT, standard Copilots) systematically hallucinate architectural intent, invent non-existent PR discussions, and hallucinate commit hashes when asked *why* a particular method was written. Code comprehension requires proof, not plausible prose.
- **Final Problem Statement:** When joining unfamiliar codebases or triaging 2 AM production outages, software engineers spend up to 40% of their time performing forensic archaeology across fragmented Git blame logs, Slack discussions, and outdated wikis. ARCHON solves this by reconstructing verifiable architectural provenance through an evidence-first knowledge graph synthesizing four ground-truth pillars: Git commits, AST contracts, test suites, and reverse call hierarchies.

---

### 2. Intended User & Current Alternatives

- **Target User:** Senior software engineers, newly onboarding engineers, and on-call platform/SRE engineers responsible for maintaining or modifying legacy systems.
- **Current Alternatives:**
  - `git log -S <symbol>` / `git blame`: Line-oriented diff dumps lacking semantic understanding of functions or caller dependencies.
  - Generic LLM Copilots: Generate ungrounded explanations without verifying whether historical commits or test cases support the claim.
  - Manual Slack/Jira searches: Fragmented, slow, and dependent on institutional memory that leaves when authors depart.

---

### 3. What the Prototype Actually Does

ARCHON statically analyzes a target repository and constructs an idempotent knowledge graph in Neo4j (or an in-memory fallback adapter if Neo4j is offline). It extracts:
1. **Temporal Intent:** Git commit archaeology, author attribution, commit messages, and historical diff changes via Git pickaxe mining.
2. **Contract Invariants:** Class definitions, function signatures, docstrings, and invariants via Python's standard library `ast.parse`.
3. **Verification Mesh:** Test assertions linking symbols to test cases guarding them against regression.
4. **Structural Blast Radius:** Reverse call dependencies mapping which files and caller symbols depend on the investigated component.

The synthesis engine outputs an evidence dossier linking each explanatory statement to an exact verified receipt (e.g., commit hash, file path, and line bounds).

---

### 4. Primary Demonstration Flow & Execution

1. **Launch Services:** Execute `start_archon.bat` (or `python dev.py`). This starts Django REST on `:8000` and Next.js 16 on `:3000`.
2. **Access Dashboard:** Open `http://localhost:3000` in a browser.
3. **Validate & Index Target Repository:** On the **Command Center** tab, select the default repository (`C:\Users\mustafa\Desktop\BAHub`) or enter a local Git repository path. Click **Validate**, then click **Index Neo4j**. Real symbols, test relationships, and call edges are ingested into the graph.
4. **Execute Forensic Investigation:** Switch to the **Investigation Workspace** tab. Enter or select target symbol `TenantSubscription` (or demo `charge_with_idempotency_key`) with question *"Why was this introduced?"*. Click **Investigate Symbol**.
5. **Inspect Evidence Receipts:** The center panel renders the factual synthesis. Clicking any evidence badge highlights the corresponding ground-truth receipt (commit diff, AST signature, test assertion line, or caller dependency) in the right-hand panel.
6. **Inspect Architecture Topology:** Switch to the **Architecture Graph** tab to visualize the 2D multi-column node layout with directed `CALLS` and `TESTS` edges rendered via React Flow.

---

### 5. What the Prototype Deliberately Does NOT Do

- **Zero Target Code Execution:** ARCHON never imports or executes analyzed codebase files in the host runtime (`no exec()`, `no eval()`, `no importlib`).
- **No Unbounded Vector Search:** Core symbol lookups do not rely on fuzzy vector embeddings, avoiding semantic drift and hallucinated node links.
- **No Cloud Secret Exfiltration:** Files matching `.env*`, `*pem`, `*key`, `*token*`, or `id_rsa*` are strictly blacklisted from ingestion, display, or transmission.
- **No Multi-Language Runtime Compilation:** AST extraction in Milestone 2 is strictly static Python AST; multi-language Tree-sitter parsers are planned for Milestone 3.

---

### 6. Tech Stack & Architectural Decisions

- **Backend:** Django 6.1.2 + Django REST Framework 3.18.3. Thin HTTP transport layer backed by isolated service modules in `archon/core/`.
- **Frontend:** Next.js 16.4.2 App Router (Turbopack) + React 19.3.0 + Strict TypeScript (0 `any` annotations). Leaf Client Component architecture.
- **Graph Canvas:** `@xyflow/react` 12.12.0 with a custom 2D grid wrapping layout engine (`web/lib/graphLayout.ts`).
- **Graph Storage:** Neo4j 6.4.1 Bolt driver with idempotent Cypher `MERGE` statements and an automatic in-memory fallback adapter ensuring 100% offline uptime.
- **Static Parser:** Python 3.14 standard library `ast` module.
- **Subprocess Isolation:** `subprocess.run(..., shell=False)` with argument arrays to prevent shell injection.

---

### 7. Evidence Position: Verified Facts vs Inferences

- **Verified Ground Truth:** 30/30 backend unit/API tests pass with `pytest`. ESLint passes with 0 errors and 0 warnings. Next.js production build exits code 0. Deterministic Cypher queries execute in < 20ms. Neo4j unique constraints guarantee idempotent ingestion.
- **Empirical Inferences:** Test assertions containing a symbol name in test files correlate directly with regression guard intent.
- **Hypotheses Pending Validation:** Whether automated Git commit summarization accelerates onboarding comprehension to the same degree across legacy enterprise codebases with poor commit hygiene.

---

### 8. Known Technical Limitations

1. **AST Language Support:** Milestone 2 parser is native to Python `.py` files. JavaScript/TypeScript files are tracked as file-level nodes without deep symbol-level AST call extraction.
2. **Git Depth Throttling:** For sub-second response times, Git pickaxe search bounds commit history scans to the 20 most recent matching commits.
3. **Database Dependency:** If external Neo4j cloud instances experience transient connection timeouts, ARCHON automatically falls back to static AST in-memory topology.

---

### 9. Next Milestones & Pre-Deployment Validation

1. **Enterprise Customer Discovery:** Conduct structured qualitative interviews with 10 on-call platform engineers to quantify time saved during real incident triage.
2. **Multi-Language Tree-sitter Engine:** Integrate Tree-sitter for TypeScript, Go, and Java symbol extraction.
3. **Issue Tracker Connectors:** Implement read-only Jira/Linear connectors to correlate commit SHAs with original incident post-mortems.
