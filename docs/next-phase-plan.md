# ARCHON — Next-Phase Implementation Plan

**Milestone Focus:** Phase 6 Stabilization & Phase 10 Git Initialization  
**Target Title:** "Frontend Hardening, Zero-Lint Discipline, Component Modularization & Version Control Initialization"  
**Document Version:** 1.0.0  
**Date:** October 22, 2026  
**Status:** Ready for Execution  

---

## 1. Objective

Stabilize the Next.js production frontend and establish proper version control for ARCHON. This will achieve a **100% green verification baseline** across both backend (`pytest`: 29/29) and frontend (`eslint`: 0 errors, `next build`: 0 errors) while establishing Git version tracking for the repository.

---

## 2. Scope & Explicit Non-Goals

### In Scope:
1. **Initialize Git Repository:** Run `git init` in `c:\Users\mustafa\Desktop\ARCHON`, configure `.gitignore`, and create the initial baseline commit.
2. **Eliminate All Frontend Lint Errors:** Fix all 5 `@typescript-eslint/no-explicit-any` errors in `web/app/page.tsx` by introducing strictly typed interfaces in `web/lib/types.ts`. Remove 3 unused imports (`GitCommit`, `FileCode`, `Layers`).
3. **Decompose Monolithic Client Component:** Refactor the 949-line `web/app/page.tsx` into modular leaf components under `web/components/`:
   - `web/components/tabs/CommandCenterTab.tsx`
   - `web/components/tabs/ExplorerTab.tsx`
   - `web/components/tabs/InvestigationTab.tsx`
   - `web/components/tabs/GraphTab.tsx`
   - `web/components/tabs/ImpactTab.tsx`
   - `web/components/tabs/EvaluationTab.tsx`
4. **Interactive Evidence Citations:** Enable clicking citation badges (e.g. `[c4b12a8]` or `[test_charge]`) to scroll to and highlight the corresponding evidence card.
5. **Unified Startup Script:** Author `start_archon.bat` and `start_archon.ps1` to launch Django and Next.js concurrently with health checks for hackathon judges.

### Explicit Non-Goals:
- **Do NOT rewrite backend services or serializers:** The existing Django REST API and `archon/` services are verified complete and must not be touched.
- **Do NOT introduce third-party UI component libraries (e.g. Shadcn/Radix):** Use existing Tailwind CSS v4 and Lucide-react icons to keep bundle size small and avoid dependency conflicts.
- **Do NOT force a mandatory Neo4j server install:** Keep the in-memory fallback adapter active so the app remains 100% operational offline.
- **Do NOT implement speculative multi-language AST parsers:** Retain Python AST focus for the hackathon baseline.

---

## 3. Prerequisites

- Python 3.14 virtual environment with Django running on port 8000 (`task-307`).
- Node.js 24 and npm 11 running Next.js dev server on port 3000 (`task-316`).
- Existing 29 pytest tests passing.

---

## 4. Required Implementation Changes

### 4.1 Git Initialization
- Run `git init` in `c:\Users\mustafa\Desktop\ARCHON`.
- Verify `.gitignore` ignores `.venv/`, `__pycache__/`, `db.sqlite3`, `web/.next/`, `node_modules/`.
- Commit all existing work as `feat: initial commit of ARCHON 2.0 platform`.

### 4.2 Type Hardening (`web/lib/types.ts`)
Add missing interface contracts:
```typescript
export interface GraphContextData {
  nodes?: Array<{ id: string; label: string; [key: string]: unknown }>;
  edges?: Array<{ source: string; target: string; type: string; [key: string]: unknown }>;
  summary?: string;
}

export interface ImpactAnalysisResult {
  target_symbol: string;
  affected_files: string[];
  direct_callers: string[];
  affected_tests: string[];
  overall_risk: "LOW" | "MEDIUM" | "HIGH";
  risk_reason: string;
  is_advisory_only: boolean;
}
```

### 4.3 Component Modularization
- Split `web/app/page.tsx` from 949 lines down to a clean ~150-line state controller.
- Place view logic in dedicated leaf components in `web/components/tabs/`.

### 4.4 Unified Launch Script
- Create `start_archon.bat`:
```bat
@echo off
echo Starting ARCHON 2.0 Full-Stack Platform...
start cmd /k ".\.venv\Scripts\python.exe manage.py runserver 8000"
start cmd /k "cd web && npm.cmd run dev -- -p 3000"
echo ARCHON is booting. Open http://localhost:3000 in your browser.
```

---

## 5. Implementation Order

1. **Step 1:** Initialize Git in workspace root and verify tracked files.
2. **Step 2:** Update `web/lib/types.ts` with strict types replacing all `any`.
3. **Step 3:** Extract tab components into `web/components/tabs/`.
4. **Step 4:** Refactor `web/app/page.tsx` to import leaf components.
5. **Step 5:** Run `npm.cmd run lint` and verify 0 errors.
6. **Step 6:** Run `npm.cmd run build` and verify production compilation.
7. **Step 7:** Run `.\.venv\Scripts\python.exe -m pytest` to verify 29/29 tests still pass.
8. **Step 8:** Create `start_archon.bat` single-click demo script.

---

## 6. Acceptance Criteria

- [ ] `git status` displays active Git repository with clean working tree.
- [ ] `npm.cmd run lint` exits with **0 errors and 0 warnings**.
- [ ] `npm.cmd run build` completes successfully with code 0.
- [ ] `pytest` passes **29/29 tests**.
- [ ] Next.js dashboard renders correctly on `http://localhost:3000` with all 6 tabs functioning.
- [ ] `web/app/page.tsx` file length reduced below 200 lines.
- [ ] Single-click script successfully starts the platform.

---

## 7. Verification Commands

```powershell
# 1. Verify Git status
git status

# 2. Verify Frontend Linting
cd web; npm.cmd run lint

# 3. Verify Frontend Build
npm.cmd run build; cd ..

# 4. Verify Backend Test Suite
.\.venv\Scripts\python.exe -m pytest

# 5. Verify Live Endpoints
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/v1/health/
Invoke-RestMethod -Uri http://localhost:3000/
```

---

## 8. Risks & Fallback Plan

| Risk | Probability | Impact | Mitigation / Fallback |
| :--- | :--- | :--- | :--- |
| Component extraction introduces state prop drilling issues | Low | Medium | Keep high-level workspace state in `page.tsx` or simple React context, passing explicit typed props to tabs. |
| ESLint rules conflict with Next.js Turbopack | Low | Low | Adhere strictly to Next.js recommended ESLint configuration already in `package.json`. |
| Git init accidentally stages `.venv` or `.next` | Medium | High | Verify `.gitignore` contains `.venv/`, `node_modules/`, `.next/`, `*.pyc` *before* running `git add .`. |

---

## 9. Definition of Done

This milestone is complete when:
1. `npm.cmd run lint` and `npm.cmd run build` pass with exit code 0.
2. All 29 pytest tests continue to pass.
3. The Next.js dashboard is verified responsive in the browser with modular component architecture.
4. The ARCHON repository is cleanly committed to local Git.
5. `start_archon.bat` boots the system reliably.

---

## 10. Estimated Effort & Next Phase Transition

- **Estimated Effort:** 45 – 75 minutes of engineering execution.
- **Condition for Next Phase:** Once this milestone is completed and verified, ARCHON moves directly to **Phase 9 / Phase 12 (Judge-Ready Demo Rehearsal & Submission Package Recording)**.
