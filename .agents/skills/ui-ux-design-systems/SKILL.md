---
name: ui-ux-design-systems
description: Guides developer-tool design systems, high-density layouts, design tokens, React Flow graph styling, and accessibility compliance.
---

# Advanced UI/UX & Design Systems Skill

## Purpose
This skill ensures ARCHON delivers a polished, high-density developer experience worthy of elite engineering tools (e.g. Linear, Sentry, Raycast). It prevents childish animations, low-contrast palettes, fake metrics, and generic chatbot layouts.

## Activation Criteria
Activate this skill whenever:
- Designing new screens, workspaces, or modals.
- Establishing or updating design tokens, typography, or color themes.
- Implementing graph visualization canvases (`@xyflow/react`).
- Reviewing interfaces for WCAG 2.2 AA accessibility and information density.

## Required Tools
- `view_file` / `replace_file_content` / `write_to_file`: Edit Tailwind classes, CSS tokens, and component layouts.
- `browser_subagent`: Conduct visual inspection and interaction verification in the browser when available.

## Design System Principles for ARCHON
1. **Professional Tool Aesthetic:**
   - Dark theme based on deep slate (`#090d16` background, `#0f172a` panels, `#1e293b` borders).
   - High information density without visual clutter: compact padding (`p-3`, `gap-2`), clear metadata tables, monospace chips for code tokens.
2. **Restrained, Meaningful Status Indicators:**
   - Emerald (`#34d399`): Verified ground-truth evidence (tests passing, commit verified).
   - Amber (`#fbbf24`): Blast-radius warnings, downstream callers.
   - Rose (`#f87171`): Breaking changes, missing test coverage, regression hazards.
   - Sky (`#38bdf8`): Temporal Git history, author metadata.
3. **Graph Visualization Excellence:**
   - React Flow nodes must use distinct borders, clear typography, and subtle shadows.
   - Edge labels must explicitly display relationship types (`CALLS`, `TESTS`, `DEFINED_IN`).
   - Implement viewport bounding and min/max zoom limits (0.2x to 1.5x) to prevent disorientation.
4. **Honesty & Integrity in UI:**
   - Never display placeholder buttons that do nothing.
   - If a feature is planned for a future milestone, display it in a clearly marked `[Planned Feature]` section or disable the button with an explanatory tooltip.
   - Clearly distinguish between extracted source truth and AI interpretation.

## Step-by-Step Procedure
1. **Define Task Flow & Information Architecture:**
   - Map user journey: Repository Selection → Symbol Exploration → Evidence Review → Blast Radius Graph.
2. **Apply Semantic Design Tokens:**
   - Use tokens defined in `docs/ui-ux-research.md` (Slate surfaces, Indigo primary, status accents).
3. **Implement Responsive Panes:**
   - Multi-column layout on desktop (`lg:grid-cols-12`); stacked, scrollable layout on mobile/tablet.
4. **Enforce Accessibility (WCAG 2.2 AA):**
   - Check contrast ratio of all text against surface backgrounds (>= 4.5:1).
   - Ensure every button and input has visible focus states and accessible labels.
5. **Conduct 8-Point Usability Audit:**
   - Run the usability checklist from `docs/ui-ux-research.md`.

## Verification Criteria
- [ ] Interface passes 8-point usability audit.
- [ ] No unstyled elements, default browser buttons, or broken alignment.
- [ ] Graph canvas remains smooth and responsive with minimap and controls.

## Expected Deliverables
- Reusable, accessible UI components adhering to the ARCHON design system.
- Structured UI design critique when reviewing existing interfaces.
