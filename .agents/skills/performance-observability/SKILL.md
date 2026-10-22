---
name: performance-observability
description: Guides performance measurement, large repository scaling, AST caching, query optimization, API latency monitoring, and bundle size control.
---

# Performance & Production Readiness Skill

## Purpose
This skill establishes performance optimization and observability standards for ARCHON. It prohibits guessing or premature optimization and enforces empirical measurement of repository scanning, AST caching, API response times, and frontend bundle size.

## Activation Criteria
Activate this skill whenever:
- Scanning repositories exceeding 1,000 files or 50,000 lines of code.
- Optimizing AST parsing, Git subprocess execution, or Cypher queries.
- Evaluating API latency or payload size across `/api/v1/` endpoints.
- Measuring Next.js frontend bundle size and initial page load speed.

## Required Tools
- `run_command`: Run benchmarks, profile scripts, and bundle analyzers.
- `view_file` / `replace_file_content`: Implement caching and batching strategies.

## Performance Benchmarks & Targets
- **AST Repository Scan:** <= 3.0 seconds for repositories under 100,000 LOC.
- **Git Symbol Extraction:** <= 1.5 seconds for history depth up to 500 commits.
- **API Investigation Response:** <= 800ms for single-symbol ground-truth query.
- **Graph Traversal (2-hop blast radius):** <= 250ms query time in Neo4j.
- **Frontend Initial Load:** First Contentful Paint (FCP) <= 1.2s; zero layout shifts.

## Empirical Optimization Workflow
1. **Measure First (Never Guess):**
   - Profile the slow path using `time.perf_counter()` or Python's `cProfile`.
   - Identify the actual bottleneck: I/O (disk/Git subprocess), parsing (AST tree walks), or network serialization.
2. **Apply Targeted Caching:**
   - **AST Cache:** Cache parsed module ASTs by file path and `mtime` so unchanged files are not re-parsed.
   - **Git Blame Cache:** Cache commit metadata by commit SHA (commits are immutable in Git).
3. **Batching & Pruning:**
   - Instead of running 50 sequential `git log` commands, batch symbol queries or leverage `git log -S <symbol>` with path filters.
   - Prune graph traversals: limit default blast-radius depth to 2 hops, with user-prompted on-demand expansion.
4. **Frontend Asset Optimization:**
   - Lazy-load heavy visualization libraries (e.g., dynamic import for `@xyflow/react`).
   - Eliminate duplicate packages or unused icon sets.
5. **Observability & Logging:**
   - Log query durations and scan counts at `INFO` level.
   - Include timing metrics in the API response metadata: `{"timings": {"ast_scan_ms": 142, "git_extraction_ms": 310}}`.

## Verification Criteria
- [ ] Measured execution time shows quantifiable improvement before and after optimization.
- [ ] Memory footprint remains stable during large repository scans.
- [ ] Caching layers invalidate correctly when file `mtime` changes.

## Expected Deliverables
- Benchmark results and profiling summary.
- Optimized implementation with observable timing metrics.
