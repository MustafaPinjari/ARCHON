# ARCHON — The Engineering Memory Engine
### HackFront India 2026 | Track T1: AI & Developer Tools

---

## 1. The Core Problem
When a software engineer joins an existing engineering team or is paged during an incident at 2 AM, the biggest challenge isn't syntax—it's **intent**.
- *"Why is there a 450ms sleep before this database call?"*
- *"Why does this payment handler check a secondary idempotency table?"*
- *"Who decided to disable HTTP/2 on this microservice?"*

Developers spend up to **40% of their engineering time** doing forensic archaeology: searching Slack, digging through years of confusing Git blame logs, deciphering Jira tickets, and guessing why legacy decisions were made.

General LLM chatbots (ChatGPT, generic Copilots) **fail** at this task because they hallucinate rationale based on generic patterns instead of ground-truth history.

---

## 2. The Solution: ARCHON
**ARCHON is an Engineering Memory Engine.**
Instead of speculating, ARCHON reconstructs the verifiable provenance of code by synthesizing 4 empirical pillars:

1. **Temporal Git Archaeology**: Pinpoints the exact commit, PR description, author, and timestamp that changed the behavior.
2. **Contract Invariants**: Extracts docstrings, inline comments, and architectural constraints directly from the source AST.
3. **Verification Mesh**: Connects the code to real test suites that prove why edge cases exist.
4. **Structural Blast Radius**: Maps reverse dependencies so engineers know what breaks if they alter the design.

---

## 3. Why ARCHON Wins
| Feature | Generic LLM Copilot | ARCHON Engineering Memory Engine |
| :--- | :--- | :--- |
| **Ground Truth** | Hallucinates plausible reasons | 100% verifiable commits, diffs, and test suites |
| **Privacy & Security** | Ingests all files or sends code to clouds | 100% Local, zero code execution, zero secret leaks |
| **Transparency** | Black box "Trust me" response | Transparent evidence cards with links to exact lines & commits |
| **Offline First** | Requires internet and paid API keys | Works completely standalone on developer workstations |

---

## 4. Key Demos at the Hackathon
1. **The Ghost Bug Mystery**:
   - Question: *"Why was `charge_with_idempotency_key` introduced?"*
   - ARCHON surfaces the exact commit message from an outage 2 years ago (`HOTFIX-409: prevent double billing during network timeouts`), cites the test case `test_retry_after_timeout_does_not_double_charge`, and lists the 4 caller services that depend on this invariant.
2. **Live Local Repository Forensic**:
   - Inspect any Git repo on the machine: ARCHON runs safe, offline commit searches and maps out dependency callers in seconds.

---

## 5. Future Roadmap
- **AST Semantic Graph**: Deep cross-file call hierarchy via Tree-sitter.
- **Git Bi-Temporal Index**: Fast indexing of multi-year repos with tens of thousands of commits.
- **Slack / Jira / Linear Connector**: Correlating commit SHAs with engineering discussion threads.
