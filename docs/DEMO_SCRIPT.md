# ARCHON 2.0 — Hackathon Demonstration Script
### HackFront India 2026 | Track T1: AI and Developer Tools | Priority: Neo4j Track

---

## 🎬 3-Minute Live Hackathon Pitch & Demo Walkthrough

### Part 1: The Hook (30 Seconds)
> *"Judges, imagine you join an engineering team or get paged at 2 AM for an incident. You see legacy code with an odd 24-hour Redis timeout or a weird idempotency hash check. If you ask ChatGPT or generic Copilot 'Why was this written this way?', they hallucinate plausible-sounding stories.
>
> We built **ARCHON 2.0**: The Evidence-First Engineering Memory Engine. ARCHON grounds every explanation in a verifiable **Neo4j Knowledge Graph**, **Python AST analysis**, and **Git commit archaeology**."*

---

### Part 2: Engineering Command Center (30 Seconds)
1. Open **[http://localhost:3000](http://localhost:3000)** in the browser.
2. Point out the telemetry bar:
   - Django REST API: `ONLINE (:8000)`
   - Neo4j Knowledge Graph: `ACTIVE / RESILIENT FALLBACK`
   - Security: `Zero-Execution Boundary Active (Air-Gapped Static Analysis)`
3. Show the target repository selector:
   - Toggle to **Local Git Workspace** and enter `C:\Users\mustafa\Desktop\BAHub`.
   - Click **Validate** -> Show the verified branch (`main`) and file count (`464 files`).
   - Click **Index Neo4j** -> Show real AST extraction and idempotent Cypher ingestion.

---

### Part 3: The 3-Panel Investigation Workspace (60 Seconds)
1. Switch to the **Investigation Workspace** tab.
2. **Left Panel**: Target symbol `TenantSubscription` (or demo `charge_with_idempotency_key`).
   - Question: *"Why was this function introduced?"*
   - Click **Execute Investigation**.
3. **Center Panel**: Show the honest evidence banner and **Executive Synthesis**:
   - Point out that it cites exact commit hashes (`f4e6aa1`, `b9ad941`), definition lines (`backend/billing/models.py:Line 4`), and 36 test assertions.
4. **Right Panel**: Show the 4 Verifiable Evidence Pillars:
   - **Git Commits**: Click the commit card to see author, date, and diff stat.
   - **Contract AST**: Click to view the extracted Python class definition and docstrings.
   - **Test Mesh**: Click to view `backend/audit/tests.py:Line 23` guarding this component.
   - **Blast Radius**: Click to view caller references in `ai_orchestrator/credit_manager.py:Line 25`.

---

### Part 4: Interactive Neo4j Architecture Graph (30 Seconds)
1. Switch to the **Architecture Graph** tab.
2. Interact with the **React Flow canvas**:
   - Drag nodes representing `Symbol`, `Test`, `Commit`, and `File`.
   - Zoom in on the directed edges: `(:File)-[:DEFINES]->(:Symbol)`, `(:Test)-[:TESTS]->(:Symbol)`, `(:Symbol)-[:CALLS]->(:Symbol)`.
   - Explain that all relationships are queried dynamically from the Neo4j Knowledge Graph.

---

### Part 5: Change Impact Intelligence & Evaluation (30 Seconds)
1. Switch to **Change Impact**:
   - Proposed change: *"Change expiration window and add distributed lock retry."*
   - Click **Analyze Change Impact**.
   - Show the structured blast radius report: High/Medium risk ratings, affected caller lines, and the exact test suites that must be run before merging.
2. Switch to **Evaluation & Trust**:
   - Click **Run Benchmark**.
   - Show empirical metrics: **100% Citation Validity**, **100% Answer Support Rate**, **0 Unsupported Claims**, and sub-50ms deterministic latency.
3. Conclude:
   > *"ARCHON replaces hallucination with ground truth. Thank you!"*
