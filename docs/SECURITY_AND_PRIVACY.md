# ARCHON Security and Privacy Architecture

## Philosophy: Zero Trust, Zero Code Execution

ARCHON is built to analyze enterprise and proprietary repositories safely on local developer workstations. Because analyzing unfamiliar repositories inherently involves untrusted source code, ARCHON implements strict security boundaries.

---

## 1. Zero Code Execution
- **No Dynamic Imports**: ARCHON never imports or executes `eval()`, `exec()`, or Python `importlib` on the target repository.
- **Static Analysis Only**: Repositories are inspected solely using file I/O, regular expressions, AST parsers, and read-only Git CLI calls.
- **No Script Execution**: Pre-commit hooks, build scripts (`npm build`, `Makefile`, `setup.py`), or tests inside the analyzed repository are never executed automatically.

## 2. Secret & Credential Sanitization
ARCHON automatically blacklists files and patterns known to contain credentials:
- Environment files: `.env`, `.env.local`, `.env.production`
- Cryptographic keys: `*.pem`, `*.key`, `*.cert`, `id_rsa`, `id_ed25519`
- Cloud & SaaS credentials: `credentials.json`, `token.json`, `service-account*.json`
- Pattern scrubber: Automatic regex masking for strings matching AWS keys (`AKIA...`), GitHub PATs (`ghp_...`), and Bearer tokens.

## 3. Safe Path Handling
- **Path Canonicalization**: All input paths are resolved with `os.path.realpath` and `os.path.abspath`.
- **Directory Traversal Defense**: ARCHON validates that all file inspection targets remain within the designated repository root boundary.
- **Ignored Directories**: ARCHON strictly ignores `node_modules`, `.venv`, `venv`, `.git`, `__pycache__`, `dist`, and `build` directories during scans to maintain performance and avoid reading generated binaries.

## 4. 100% Offline & Air-Gapped Capable
- The core engine does not make any outbound network requests.
- No telemetry, analytics, or source code snippets are transmitted off the machine.
- Fully operational without internet connectivity once installed.
