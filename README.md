# ARCHON 2.0 — The Engineering Memory Engine
> **hackFront India 2026** | **Theme: T1 — AI and Developer Tools** | **Priority: Neo4j Track**  
> *"An evidence-first engineering intelligence platform that reconstructs the likely reasoning behind code decisions and explains potential consequences of changes using verifiable repository evidence and Neo4j GraphRAG."*

---

## 🌟 What is ARCHON 2.0?

Traditional AI code assistants guess or hallucinate when asked *"Why was this written this way?"*. 
**ARCHON 2.0** uses a **GraphRAG architecture** backed by **Neo4j**, **Python AST analysis**, and **Git commit archaeology** to ground every explanation in verifiable evidence.

```
                          ┌──────────────────────────┐
                          │   ARCHON Memory Engine   │
                          └─────────────┬────────────┘
                                        │
        ┌───────────────────┬───────────┴───────────┬───────────────────┐
        ▼                   ▼                       ▼                   ▼
┌───────────────┐   ┌───────────────┐       ┌───────────────┐   ┌───────────────┐
│ 1. Temporal   │   │ 2. Contract   │       │ 3. Test Mesh  │   │ 4. Blast      │
│    Intent     │   │    Invariants │       │    Guardians  │   │    Radius     │
│  (Git Blame,  │   │  (Docstrings, │       │  (Regression  │   │  (Callers &   │
│   Diffs, SHAs)│   │   AST Types)  │       │   Assertions) │   │  Dependencies)│
└───────┬───────┘   └───────┬───────┘       └───────┬───────┘   └───────┬───────┘
        │                   │                       │                   │
        └───────────────────┴───────────┬───────────┴───────────────────┘
                                        ▼
                          ┌──────────────────────────┐
                          │   Neo4j Knowledge Graph  │
                          │ (:Symbol)-[:CALLS]->(...)│
                          └──────────────────────────┘
```

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS, React Flow, Lucide Icons |
| **Backend API** | Python 3.14, Django 6, Django REST Framework, Pydantic, django-cors-headers |
| **Graph Database** | Neo4j 5.x+, Official Neo4j Python Driver, Cypher |
| **Analysis** | Python AST (`ast` module), Git CLI (pickaxe `-S`, blame, log), Secret Scrubber |
| **Quality & Tests**| Pytest, DRF API Client Tests, Ruff Linter |
| **Local Fallback** | SQLite for metadata, Streamlit dashboard fallback (`app.py`) |

---

## 🚀 Quickstart for Windows

### 1. Prerequisites
- **Windows 10 / 11**
- **Python 3.10+** (tested on 3.14)
- **Node.js 18+** & `npm.cmd`
- **Git** (for commit archaeology)
- *(Optional)* **Neo4j Desktop / Docker / AuraDB** (ARCHON runs safely offline with clear fallback indicators if Neo4j is offline)

### 2. Backend Setup (Django REST API)

In PowerShell:

```powershell
# 1. Activate Virtual Environment
.venv\Scripts\Activate.ps1
# (Or if script execution is restricted: Set-ExecutionPolicy -Scope Process Bypass)

# 2. Run Database Migrations
.\.venv\Scripts\python.exe manage.py migrate

# 3. Start Django API Server (Runs on http://localhost:8000)
.\.venv\Scripts\python.exe manage.py runserver 8000
```

### 3. Frontend Setup (Next.js App)

In a separate PowerShell window:

```powershell
cd web
npm.cmd install
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧭 Product Workspaces

1. **Engineering Command Center**: Workspace summary, repository safety verification, and telemetry.
2. **Repository Explorer**: Whitelisted file tree, class/function AST catalog, and docstring contracts.
3. **Investigation Workspace**: 3-panel layout (Repo/Symbol picker, Investigation Timeline & Synthesis, Evidence Inspector).
4. **Interactive Architecture Graph**: Real-time **React Flow** graph rendering nodes (`File`, `Symbol`, `Test`, `Commit`) and edges (`CALLS`, `TESTS`, `IMPORTS`, `MODIFIES`) queried from Neo4j.
5. **Change Impact Analyzer**: Advisory impact reporting mapping direct callers, affected tests, and historical volatility.
6. **Evaluation & History**: Benchmark tracking precision, citation validity, and latency.

---

## 🧪 Running the Automated Test Suite

```powershell
# Run backend pytest suite
.\.venv\Scripts\python.exe -m pytest -v
```

---

## 🛡️ Security & Privacy Guard
- **Zero Code Execution**: Analyzed repositories are never imported or executed in runtime.
- **Strict Path Boundary**: Enforces directory validation and traversal defense.
- **Automated Secret Scrubber**: AWS keys, GitHub tokens, passwords, and `.env` files are automatically redacted.
- **100% Local**: No repository code or telemetry is transmitted to external clouds by default.
