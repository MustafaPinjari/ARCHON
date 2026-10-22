---
name: staff-architect
description: Guides strategic architectural decisions, system boundary definition, migration planning, ADR authoring, and complexity reduction.
---

# Staff Software Architect Skill

## Purpose
This skill guides the evaluation and design of ARCHON's macro-architecture. It prevents architectural drift, redundant business logic, over-engineering, and tight coupling between domain logic and presentation frameworks.

## Activation Criteria
Activate this skill whenever:
- Designing new architectural components, subsystems, or multi-service integrations.
- Evaluating a major migration (e.g. SQLite to PostgreSQL, in-memory graph to Neo4j cluster).
- Introducing new abstractions, database schemas, or communication protocols.
- Refactoring core domains across backend, frontend, or data storage.

## Required Tools
- `view_file`: Inspect existing architecture docs (`docs/ARCHITECTURE.md`, `docs/engineering-decisions.md`).
- `run_command`: Inspect system topology, environment variables, running processes.
- `write_to_file` / `replace_file_content`: Record Architecture Decision Records (ADRs).

## Step-by-Step Procedure
1. **Audit Current State:**
   - Map existing component boundaries and data flows before proposing any change.
   - Verify active constraints (e.g. offline fallback requirement, zero-target-execution security rule).
2. **Formulate Alternatives:**
   - Identify at least two realistic implementation paths (e.g. in-process library vs network service; synchronous vs async queue).
   - Document trade-offs: latency, complexity, maintenance cost, operational overhead.
3. **Apply the Principle of Minimum Complexity:**
   - Select the simplest sound solution that satisfies current requirements and near-term extension points.
   - Reject speculative abstractions that solve problems ARCHON does not currently have.
4. **Draft Architecture Decision Record (ADR):**
   - Record Context, Decision, Alternatives Considered, Trade-offs, and Consequences in `docs/engineering-decisions.md`.
5. **Establish Phased Migration Paths:**
   - Design changes to be backward-compatible with existing working endpoints and UI components.
   - Never break working features in pursuit of an architectural rewrite.

## Verification Criteria
- [ ] Domain logic remains strictly independent of HTTP/UI transport layers.
- [ ] Every architectural choice is documented with an ADR.
- [ ] No single point of failure introduced; offline fallbacks are maintained.
- [ ] Complexity additions are justified by measurable functional requirements.

## Failure Handling
- If an architectural proposal introduces high operational complexity (e.g. distributed message brokers for single-machine analysis), pause and reject it in favor of an in-process queue or direct synchronous call.
- If an architectural change breaks backward compatibility with existing tests, design an adapter layer.

## Expected Deliverables
- Architecture Decision Record (ADR) added to `docs/engineering-decisions.md`.
- Updated system diagrams (Mermaid format) in `docs/ARCHITECTURE.md`.
