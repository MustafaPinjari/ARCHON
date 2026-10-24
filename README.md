# ARCHON 2.0 — The Engineering Memory Engine
> **hackFront India 2026** | **Theme: T1 — AI and Developer Tools** | **Problem: T1.1 — “Why The Code Is Like This”** | **Neo4j Priority Track**

---

### 1. What ARCHON Does (In Two Sentences)
ARCHON is an evidence-first engineering memory engine that reconstructs the hidden rationale, historical context, and blast-radius consequences behind unfamiliar software code. Instead of guessing, ARCHON synthesizes Git commits, Python AST contracts, test assertions, and call hierarchies into an idempotent Neo4j Knowledge Graph with 100% verified ground-truth citations.

---

### 2. Intended User & Problem
- **Target User:** Senior software engineers, newly onboarding developers, and on-call SRE/platform engineers.
- **Problem Solved:** When engineers encounter legacy code during an incident or refactor, they spend up to 40% of their time guessing *why* the code was written this way. Generic AI chatbots hallucinate plausible stories because they lack grounded repository history. ARCHON bridges this gap by extracting verifiable factual provenance directly from the codebase.

---

### 3. Primary Demonstrated Workflow
**The 3-Step Forensic Investigation Workflow:**
1. **Target Selection:** An engineer specifies a target symbol (e.g. `TenantSubscription` in `BAHub` or demo `charge_with_idempotency_key`) and an investigation question (*"Why was this introduced?"*).
2. **Ground-Truth Collation:** ARCHON statically analyzes the repository, querying the Neo4j Knowledge Graph for callers, test suites, and Git pickaxe commits.
3. **Verified Evidence Synthesis:** ARCHON renders an executive synthesis where every claim is tagged with clickable badges (`[f4e6aa1]`, `[test_charge]`) that open exact line numbers and commit diffs in the inspector panel.

---

### 4. Prerequisites & Supported Runtime Versions
- **Operating System:** Windows 10/11, macOS, or Linux
- **Python:** Python 3.12, 3.13, or 3.14 (Verified on Python 3.14.7)
- **Node.js:** Node.js 18.x, 20.x, or 22+ (Verified on Node.js 24.19.0 with npm 11.17.0)
- **Git:** Git 2.30+ installed and accessible via system PATH

---

### 5. Setup & Installation Commands

#### Backend (Python & Django REST Framework):
```bash
# 1. Create and activate a virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
```

#### Frontend (Next.js 16 App Router):
```bash
# Navigate to web directory and install packages
cd web
npm install
cd ..
```

---

### 6. Safe Environment Variable Setup
Copy the provided `.env.example` template to `.env`:
```bash
cp .env.example .env
```
The `.env.example` file contains safe placeholders and development defaults. **No real credentials, API tokens, or production passwords are required to run the application.**

```ini
# Neo4j Graph Database Configuration (Optional - leave default for in-memory fallback)
NEO4J_URI=neo4j+s://<your-instance-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-secure-password>
NEO4J_DATABASE=neo4j

# Django Development Settings
DJANGO_SECRET_KEY=django-insecure-archon-dev-key-change-in-production
DJANGO_DEBUG=True
```

---

### 7. Database Setup & Offline Fallback Guarantee
- **Neo4j Aura Cloud / Local Bolt:** If you have a Neo4j instance, supply the URI and credentials in `.env`. ARCHON will automatically create indexes and idempotent constraints on startup.
- **Offline Resilient Fallback:** **No database installation is required.** If Neo4j is offline or unreachable, ARCHON automatically routes all graph queries to its built-in `InMemoryGraphAdapter`. All 8 REST endpoints, the React Flow architecture graph, and investigation workflows remain 100% operational offline.

---

### 8. Exact Commands to Start Backend & Frontend

#### Option A: Unified Windows Launcher (Recommended)
```cmd
:: In root directory:
start_archon.bat
```
*(Or via PowerShell: `.\start_archon.ps1`)*  
*(To cleanly stop all background processes: `stop_archon.bat`)*

#### Option B: Unified Development CLI
```bash
python dev.py
```
`dev.py` automatically detects your `.venv` Python and launches both the Django REST backend (`:8000`) and the Next.js frontend (`:3000`) concurrently in one terminal.

#### Option C: Manual Launch (Two Terminals)
**Terminal 1 (Backend):**
```bash
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```
**Terminal 2 (Frontend):**
```bash
cd web
npm run dev
```

---

### 9. Tests & Verification Checks for Reviewers

Reviewers can execute the following verification commands:

#### 1. Backend Pytest Suite (30 Automated Tests)
```bash
.\.venv\Scripts\python.exe -m pytest -v
```
*Expected Result:* `30 passed in ~22s` (100% pass rate covering AST parsing, Git extraction, DRF API views, and Neo4j offline fallbacks).

#### 2. Frontend ESLint Check
```bash
cd web
npm run lint
```
*Expected Result:* `Exit code 0` (0 errors, 0 warnings with strict TypeScript rules).

#### 3. Frontend Production Build Check
```bash
cd web
npm run build
```
*Expected Result:* `Exit code 0` (Turbopack production build succeeds with clean static route generation).

#### 4. REST API Health Check
```bash
curl http://127.0.0.1:8000/api/v1/health/
```
*Expected Result:* HTTP 200 with JSON payload reporting `status: "healthy"` and security boundaries active.

---

### 10. Expected Output & Demonstration Procedure
1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. **Command Center:** Observe the telemetry bar confirming Django API (`ONLINE`) and security boundaries (`Zero-Code Execution Active`). Under Repository Selector, select `C:\Users\mustafa\Desktop\BAHub` and click **Validate**, then click **Index Neo4j**.
3. **Investigation Workspace:** Click on the **Investigation Workspace** tab. Select symbol `TenantSubscription` (or demo `charge_with_idempotency_key`) and click **Investigate Symbol**.
4. **Interactive Evidence:** Inspect the center synthesis panel. Click on citation badges (`[c4b12a8]`, `[test_charge]`) to see corresponding verified receipts highlight in the right-hand evidence panel.
5. **Architecture Graph:** Switch to the **Architecture Graph** tab to explore the 2D multi-column node layout showing real `CALLS` and `TESTS` directed edges.
6. **Impact Analysis:** Switch to **Impact Analysis** to evaluate blast radius and caller risks for a proposed refactoring change.
7. **Trust & Benchmark Eval:** Switch to **Benchmark Eval** to inspect live evaluation metrics (100% precision, 0 unsupported claims).

---

### 11. Known Technical Limitations
1. **AST Language Scope:** Milestone 2 AST parsing targets Python `.py` code. JavaScript and TypeScript files are indexed at file-level granularity (Tree-sitter deep symbol extraction is planned for Milestone 3).
2. **Git Pickaxe Depth:** To ensure sub-second response times, commit pickaxe queries are bounded to the 20 most recent matching commits.
3. **Network Glitch Resilience:** If remote Neo4j Aura cloud instances encounter network socket drops, ARCHON automatically activates its in-memory fallback adapter without interrupting the user.

---

### 12. Hosted URL & Video Demonstration
- **Local Application URL:** `http://localhost:3000` (Next.js) and `http://127.0.0.1:8000` (Django REST API)
- **Demo Recording / Walkthrough:** Refer to `docs/DEMO_SCRIPT.md` for the complete 3-minute pitch walkthrough and `docs/EVALUATION_REPORT.md` for benchmark reproduction steps.
