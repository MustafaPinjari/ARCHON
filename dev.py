"""ARCHON 2.0 — Unified Developer Runner.

Runs both Django REST Backend (:8000) and Next.js Frontend (:3000)
inside the SAME IDE terminal without opening extra pop-up windows.
"""

from __future__ import annotations
import os
import sys
import time
import signal
import socket
import threading
import subprocess
from pathlib import Path

# Ensure .env is loaded automatically
import archon.env  # noqa: F401

ROOT_DIR = Path(__file__).resolve().parent
WEB_DIR = ROOT_DIR / "web"
PYTHON_EXE = sys.executable

# ANSI color codes for single-terminal log stream
ANSI_GREEN = "\033[92m"
ANSI_CYAN = "\033[96m"
ANSI_YELLOW = "\033[93m"
ANSI_RESET = "\033[0m"
ANSI_BOLD = "\033[1m"


def kill_process_on_port(port: int) -> None:
    """Finds and kills any existing process listening on the given port."""
    try:
        output = subprocess.check_output(
            f"netstat -ano | findstr :{port}", shell=True, text=True, errors="ignore"
        )
        pids = set()
        for line in output.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pids.add(parts[-1])
        for pid in pids:
            if pid and pid != "0" and int(pid) != os.getpid():
                subprocess.call(
                    f"taskkill /F /PID {pid}",
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
    except Exception:
        pass


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def stream_output(pipe, prefix: str, color: str) -> None:
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            clean_line = line.rstrip()
            if clean_line:
                print(f"{color}[{prefix}]{ANSI_RESET} {clean_line}", flush=True)
    except Exception:
        pass
    finally:
        pipe.close()


def main():
    # Enable ANSI escape sequences on Windows consoles if supported
    if sys.platform == "win32":
        os.system("")

    print(f"\n{ANSI_BOLD}{ANSI_CYAN}=========================================================={ANSI_RESET}")
    print(f"{ANSI_BOLD}{ANSI_CYAN}          ARCHON 2.0 — Engineering Memory Engine          {ANSI_RESET}")
    print(f"{ANSI_BOLD}{ANSI_CYAN}=========================================================={ANSI_RESET}\n")

    # 1. Clean up any existing listeners on ports 8000 and 3000
    kill_process_on_port(8000)
    kill_process_on_port(3000)

    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    # CREATE_NO_WINDOW prevents Windows from opening pop-up console windows
    no_window_flag = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0

    print(f"{ANSI_GREEN}[INFO] Starting Django REST Backend on :8000 (in this terminal)...{ANSI_RESET}")
    django_proc = subprocess.Popen(
        [PYTHON_EXE, "manage.py", "runserver", "127.0.0.1:8000", "--noreload"],
        cwd=str(ROOT_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        creationflags=no_window_flag,
    )

    print(f"{ANSI_CYAN}[INFO] Starting Next.js Frontend on :3000 (in this terminal)...{ANSI_RESET}")
    next_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(WEB_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        creationflags=no_window_flag,
    )

    # Start output streaming threads into current IDE terminal
    t_django = threading.Thread(
        target=stream_output, args=(django_proc.stdout, "backend", ANSI_GREEN), daemon=True
    )
    t_next = threading.Thread(
        target=stream_output, args=(next_proc.stdout, "frontend", ANSI_CYAN), daemon=True
    )
    t_django.start()
    t_next.start()

    print(f"\n{ANSI_BOLD}{ANSI_GREEN} ARCHON 2.0 IS LIVE IN THIS TERMINAL!{ANSI_RESET}")
    print("   Dashboard:   http://localhost:3000")
    print("   REST API:    http://127.0.0.1:8000/api/v1/health/")
    print(f"{ANSI_YELLOW}   Press Ctrl+C in this terminal to stop both services cleanly.{ANSI_RESET}\n")
    print("----------------------------------------------------------\n", flush=True)

    def cleanup():
        print(f"\n{ANSI_YELLOW}[INFO] Stopping ARCHON services...{ANSI_RESET}")
        for proc in [django_proc, next_proc]:
            try:
                proc.terminate()
                proc.kill()
            except Exception:
                pass
        kill_process_on_port(8000)
        kill_process_on_port(3000)
        print(f"{ANSI_GREEN}[SUCCESS] All ARCHON services stopped cleanly.{ANSI_RESET}\n")

    def sig_handler(signum, frame):
        cleanup()
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, sig_handler)

    try:
        while True:
            if django_proc.poll() is not None:
                print(f"{ANSI_YELLOW}[WARN] Django process exited (code {django_proc.poll()}){ANSI_RESET}")
                break
            if next_proc.poll() is not None:
                print(f"{ANSI_YELLOW}[WARN] Next.js process exited (code {next_proc.poll()}){ANSI_RESET}")
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


if __name__ == "__main__":
    main()
