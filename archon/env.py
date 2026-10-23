"""Environment configuration and .env file loader for ARCHON 2.0.

Provides automatic zero-dependency .env parsing and loading into os.environ.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Optional


def load_env(env_path: Optional[str] = None) -> bool:
    """Loads key-value pairs from a .env file into os.environ.
    
    Searches current working directory, workspace root, and parent directories.
    Does not overwrite existing environment variables unless they are empty.
    
    Returns:
        True if a .env file was located and loaded, False otherwise.
    """
    if env_path is None:
        candidates = [
            Path.cwd() / ".env",
            Path(__file__).resolve().parent.parent / ".env",
            Path(__file__).resolve().parent / ".env",
        ]
        for candidate in candidates:
            if candidate.is_file():
                env_path = str(candidate)
                break

    if not env_path or not os.path.isfile(env_path):
        return False

    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                # Populate if not already present or empty
                if not os.environ.get(key):
                    os.environ[key] = val
        return True
    except Exception:
        return False


# Automatically invoke on module import
load_env()
