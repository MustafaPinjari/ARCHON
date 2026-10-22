# ARCHON UI/UX Design System & Experience Research

**Document Version:** 1.0.0  
**Research Date:** October 22, 2026  
**Status:** Approved Design Standard  
**Role:** Senior UI/UX Designer & Frontend Architect  

---

## 1. Design Philosophy & Product Identity

ARCHON is an **Engineering Intelligence & Code Archaeology Tool**, not a generic conversational AI chatbot.
Its users are software engineers, tech leads, security auditors, and system architects. They value:
- **Information Density without Clutter:** High signal-to-noise ratio; compact, readable metadata tables, file paths, and commit hashes.
- **Verifiable Truth over AI Narrative:** AI-generated text must be clearly demarcated as synthesis, always citing concrete, clickable evidence tokens.
- **Predictable, Fast Navigation:** Keyboard shortcuts, instant filter inputs, visible focus rings, responsive panes, and deterministic layouts.
- **Zero Fake UI:** No synthetic "99.8% confidence" badges, no non-functional placeholder buttons, no fabricated graph relationships.

---

## 2. Competitive Benchmarks & Reference Products

| Reference Product | Key Strengths to Emulate | Anti-Patterns to Avoid |
| :--- | :--- | :--- |
| **Linear** | Incredible keyboard navigation, crisp typography, subtle border treatments (`border-slate-800`), ultra-fast perception. | Overly minimalist icons without tooltip clarification. |
| **Sentry** | Clear error provenance, exact stack-trace inspection, breadcrumbs leading directly to line numbers. | Visual fatigue from too many competing red/orange warning badges. |
| **GitHub PR View** | Ground-truth diffs, blame annotations, commit SHA copy buttons, side-by-side verification. | Cluttered legacy tab structures and slow full-page reloads. |
| **Raycast** | Command-palette first (`Cmd+K`), instant search feedback, high-contrast dark theme. | Hiding critical contextual actions behind hidden shortcuts. |
| **Neo4j Bloom** | Interactive graph canvas, distinct color coding for node labels, expandable neighborhoods. | Unconstrained graph rendering leading to "hairball" graph visualization without filtering. |

---

## 3. Visual System & Design Tokens

### 3.1 Color Palette & Semantic Tokens
ARCHON utilizes a high-contrast dark palette tailored for prolonged engineering investigation:

- **Surface Tokens:**
  - `Background Base`: `#090d16` (Deep Obsidian / Slate 950) — High depth, reduces eye strain.
  - `Surface Panel`: `#0f172a` (Slate 900) — Main content containers, cards, and sidebars.
  - `Surface Elevated`: `#1e293b` (Slate 800) — Dropdowns, modals, hover states.
  - `Surface Border`: `#334155` (Slate 700) / `#1e293b` (Slate 800) — 1px crisp separation borders.
- **Accent Tokens:**
  - `Brand Primary`: `#6366f1` (Indigo 500) / Hover: `#4f46e5` (Indigo 600).
  - `Brand Glow`: `rgba(99, 102, 241, 0.15)` — Subtle focus rings and active node highlights.
- **Semantic Status Tokens (WCAG 2.2 AA compliant >= 4.5:1 contrast):**
  - `Success / Verified`: Text `#34d399` (Emerald 400), Badge Background `rgba(16, 185, 129, 0.12)`, Border `rgba(16, 185, 129, 0.3)`.
  - `Warning / Blast Radius`: Text `#fbbf24` (Amber 400), Badge Background `rgba(245, 158, 11, 0.12)`, Border `rgba(245, 158, 11, 0.3)`.
  - `Danger / Regression Risk`: Text `#f87171` (Rose 400), Badge Background `rgba(239, 68, 68, 0.12)`, Border `rgba(239, 68, 68, 0.3)`.
  - `Info / Temporal`: Text `#38bdf8` (Sky 400), Badge Background `rgba(14, 165, 233, 0.12)`, Border `rgba(14, 165, 233, 0.3)`.
  - `Neutral / Muted`: Text `#94a3b8` (Slate 400), Code `#cbd5e1` (Slate 300).

### 3.2 Typography & Spacing Scale
- **Display & Headings:** `Inter` or system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`). Clean, neutral, high x-height.
- **Code & Metadata:** `JetBrains Mono`, `Fira Code`, or `ui-monospace`. Used for:
  - Commit SHAs (e.g. `c4b12a8`)
  - Symbol signatures (e.g. `TenantSubscription.cancel()`)
  - File paths and line coordinates (e.g. `apps/billing/models.py:L45-89`)
- **Scale:**
  - Page Titles: `text-xl` (20px, font-semibold)
  - Section Headers: `text-sm` (14px, uppercase, tracking-wider, font-medium, text-slate-400)
  - Body Text: `text-sm` (14px, leading-relaxed, text-slate-300)
  - Metadata & Badges: `text-xs` (12px, font-mono)

---

## 4. Key Workspaces & Screen Layout

The ARCHON interface is organized into five unified panels:

1. **Command Center (Top Bar):**
   - Repository selector with path validation indicator (`Valid Git Repo` vs `Invalid Path`).
   - Symbol search input with autocomplete from indexed AST.
   - Quick Action buttons (`Investigate`, `Blast Radius`, `Export Proof`).
2. **Investigation Workspace (Left / Center Pane):**
   - Split view between **Evidence Cards** (Git temporal intent, test assertions, source contracts) and **AI Synthesis Narrative**.
   - Synthesis narrative contains clickable citation chips: clicking `[c4b12a8]` opens the Commit Drawer; clicking `[test_cancel]` scrolls to the test assertion card.
3. **Interactive Knowledge Graph (Center / Right Pane):**
   - React Flow canvas rendering nodes (`Symbol`, `Commit`, `Test`, `Caller`).
   - Directed edges representing relationships (`CALLS`, `TESTS`, `DEFINED_IN`, `MODIFIED_BY`).
   - Minimap and zoom/fit controls with bounding box to prevent infinite drift.
4. **Evidence Inspector (Right Drawer / Slide-over):**
   - Raw source code viewer with line-level highlighting.
   - Exact Git diff viewing the patch that introduced or modified the symbol.
5. **Evaluation & History Log (Bottom Panel / Modal):**
   - History of past investigated symbols and reproducibility benchmarks.

---

## 5. Graph Visualization Conventions (@xyflow/react)

- **Node Types:**
  - `TargetSymbolNode`: Gold/Indigo border, glow effect, centered anchor.
  - `CallerNode`: Slate border, incoming arrow to target.
  - `TestNode`: Emerald border with beaker icon, pointing to verified symbol.
  - `CommitNode`: Sky-blue border with git-commit icon.
- **Edge Conventions:**
  - Smooth step or bezier curves.
  - Edge labels displaying relationship type in `text-[10px] font-mono`.
  - Animated dash pattern on active blast-radius traversal path.
- **Performance Guard:**
  - Limit visible graph depth to 2 hops by default with an "Expand Neighbors" button to prevent browser canvas freeze on huge codebases.

---

## 6. Accessibility & Usability Evaluation Checklist

Every ARCHON screen must satisfy this 8-point verification checklist before release:

1. [ ] **Next Step Clarity:** Can a new developer immediately determine how to pick a repository and trigger an investigation?
2. [ ] **Evidence vs AI Demarcation:** Can the user visually tell which text was extracted verbatim from Git/AST vs generated by AI?
3. [ ] **Citation Verification:** Can the user click any citation chip to open and verify the underlying source line or commit?
4. [ ] **Predictable State Handling:** Are Loading (skeleton pulses), Empty (helpful instruction), Error (actionable fix), and Degraded (offline mock) states explicitly rendered?
5. [ ] **Responsive Density:** Does the multi-pane layout adapt smoothly between standard laptops (1366x768) and widescreen monitors (1920x1080) without content truncation?
6. [ ] **Keyboard Navigability:** Can all search inputs, citation chips, tab switches, and modal closes be triggered via `Tab`, `Enter`, and `Escape`?
7. [ ] **Accessible Contrast & Focus:** Do all interactive elements display a visible `ring-2 ring-indigo-500` on focus, and do all text tokens exceed 4.5:1 contrast against dark slate?
8. [ ] **Graceful Degradation:** When Neo4j is offline or Git is not initialized, does the UI show a clear status badge rather than crashing or showing a blank canvas?
