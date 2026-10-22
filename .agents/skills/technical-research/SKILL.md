---
name: technical-research
description: Guides evidence-based technical research, primary source verification, package vetting, and defensible technology selection.
---

# Technical Research & Decision-Making Skill

## Purpose
This skill ensures all technical decisions in ARCHON are grounded in verifiable official documentation and technical evidence. It prevents adopting deprecated, abandoned, or buzzword-driven technologies.

## Activation Criteria
Activate this skill whenever:
- Evaluating a new external library, dependency, or framework version.
- Recommending an API or design pattern that has version sensitivity.
- Encountering conflicting architectural guidance or ambiguous documentation.
- Producing technical evaluation reports or technology comparison matrices.

## Required Tools
- `search_web` / `read_url_content`: Fetch official documentation and release notes when network is available.
- `run_command`: Verify local package versions, compilers, and licenses via package managers (`pip`, `npm`).
- `view_file` / `write_to_file`: Record research findings in `docs/engineering-research.md`.

## Step-by-Step Procedure
1. **Define the Research Question:**
   - Clearly state the specific technical problem, constraint, or capability gap in ARCHON.
2. **Prioritize Primary Sources:**
   - Hierarchy of evidence:
     1. Official framework/language documentation (e.g. docs.djangoproject.com, nextjs.org).
     2. Maintained upstream repository source code, issues, and release tags.
     3. Standards bodies (e.g. W3C for accessibility, IETF for HTTP/TLS).
     4. Engineering post-mortems and verified benchmarks from reputable engineering teams.
3. **Inspect Local Environment & Version Compatibility:**
   - Run CLI checks (`python -V`, `node -v`, `pip list`, `npm list`) to verify the exact runtime environment.
   - Cross-reference peer dependencies before proposing any package addition.
4. **Evaluate Maturity, Maintenance & Security:**
   - Check commit cadence, open CVEs, license compatibility (MIT/Apache preferred; AGPL requires scrutiny).
   - Reject unmaintained packages (e.g., last commit > 2 years ago or deprecated upstream).
5. **Document Research Record:**
   - Record in `docs/engineering-research.md`: technology name, date researched, source URL, advantages, risks, implementation cost, and concrete problem solved in ARCHON.
   - Categorize as **ADOPT NOW**, **DEFER**, or **REJECT**.

## Verification Criteria
- [ ] Every recommended package is verified against the installed Python (3.14) and Node (24) runtimes.
- [ ] Zero invented citations, fictitious benchmarks, or unverified claims.
- [ ] If network search is unavailable, local package manifests and compiler types are cited with full transparency.

## Failure Handling
- If network requests fail (e.g., DNS resolution error), do NOT fabricate external sources. Clearly state the restriction, fallback to local inspection of installed library source/types, and flag assumptions for subsequent verification.

## Expected Deliverables
- Research entry in `docs/engineering-research.md` with explicit adopt/defer/reject decision and rationale.
