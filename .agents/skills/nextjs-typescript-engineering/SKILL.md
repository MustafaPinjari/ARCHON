---
name: nextjs-typescript-engineering
description: Guides Next.js 16 App Router architecture, Server/Client component boundaries, strict TypeScript, typed API clients, and accessibility.
---

# Next.js, React & TypeScript Engineering Skill

## Purpose
This skill establishes strict engineering standards for ARCHON's web frontend (`web/`). It enforces the Next.js App Router paradigm, Server/Client component boundaries, zero-`any` TypeScript discipline, and accessible component design.

## Activation Criteria
Activate this skill whenever:
- Adding or modifying frontend pages or layouts in `web/app/`.
- Creating reusable UI components in `web/components/`.
- Updating API clients or data fetchers in `web/lib/api.ts`.
- Defining TypeScript interfaces in `web/lib/types.ts`.
- Running frontend linting (`npm.cmd run lint`) or production build (`npm.cmd run build`).

## Required Tools
- `view_file` / `replace_file_content` / `write_to_file`: Edit React components and TypeScript files.
- `run_command`: Run `npm.cmd run lint` and `npm.cmd run build`.

## Core Architectural Rules
1. **Server Components by Default:**
   - Keep page-level layouts and static data containers as React Server Components (RSC).
   - Only add `"use client"` to interactive leaf components that use hooks (`useState`, `useEffect`, `useCallback`) or browser event handlers.
2. **Strict TypeScript (Zero `any` Policy):**
   - Never use `any` in component props, state, or API response handlers.
   - Use discriminated unions for polymorphic evidence models (e.g., `type EvidenceItem = GitEvidence | ASTEvidence | TestEvidence;`).
   - Define exact interface contracts in `web/lib/types.ts` mirroring the backend DRF serializer responses.
3. **Data Fetching & Resilient States:**
   - Always handle 4 essential UI states:
     1. **Loading:** Skeleton pulses or subtle loading spinners (no layout shift).
     2. **Empty:** Contextual instructions guiding the user on how to trigger an action.
     3. **Error:** Human-readable error message with retry button.
     4. **Success / Degraded:** Render live data or clear banner if running on mock fallback.
4. **Accessible Semantics (WCAG 2.2 AA):**
   - Ensure all interactive buttons have descriptive `aria-label` or visible text.
   - Ensure visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
   - Use semantic landmarks (`<main>`, `<header>`, `<nav>`, `<aside>`).

## Step-by-Step Procedure
1. **Define Types First:**
   - Update `web/lib/types.ts` with typed interfaces before writing components.
2. **Implement Leaf Components:**
   - Build focused, reusable components in `web/components/`. Keep individual component files under 250 lines.
3. **Wire API Client:**
   - Add typed fetch functions to `web/lib/api.ts` with error trapping.
4. **Assemble Page View:**
   - Integrate components into `web/app/page.tsx` maintaining server/client isolation.
5. **Verify Lint & Typecheck:**
   - Execute `npm.cmd run lint` in `web/` to confirm 0 errors and 0 `any` violations.

## Verification Criteria
- [ ] `npm.cmd run lint` exits with code 0 and zero `@typescript-eslint/no-explicit-any` errors.
- [ ] Interactive controls are fully keyboard navigable via `Tab` and `Enter`.
- [ ] No blank screens on API failure; errors are caught and rendered gracefully.

## Expected Deliverables
- Clean, strictly-typed Next.js components and type definitions.
- Verified lint output with 0 errors.
