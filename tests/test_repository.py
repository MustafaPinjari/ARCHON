"""Tests for repository validation, Git archaeology, and security boundary."""

import os
import tempfile
import pytest
from archon.repository import (
    RepositoryManager,
    SecretScrubber,
    PathValidationResult,
    BLOCKED_DIR_NAMES,
)


def test_empty_path_validation():
    result = RepositoryManager.validate_path("")
    assert not result.is_valid
    assert "empty" in result.error_message.lower()


def test_nonexistent_path_validation():
    result = RepositoryManager.validate_path("C:/NonExistentPath_xyz123987")
    assert not result.is_valid
    assert "does not exist" in result.error_message.lower()


def test_valid_directory_validation():
    with tempfile.TemporaryDirectory() as tmpdir:
        result = RepositoryManager.validate_path(tmpdir)
        assert result.is_valid
        assert os.path.exists(result.resolved_path)
        assert result.error_message is None


def test_system_root_protection():
    result = RepositoryManager.validate_path("C:\\")
    assert not result.is_valid
    assert "safety" in result.error_message.lower() or "root" in result.error_message.lower()


def test_secret_scrubber_detects_keys():
    text = "Error in AKIAIOSFODNN7EXAMPLE when pushing to AWS"
    scrubbed = SecretScrubber.scrub(text)
    assert "[REDACTED_AWS_KEY]" in scrubbed
    assert "AKIAIOSFODNN7EXAMPLE" not in scrubbed


def test_secret_scrubber_redacts_passwords():
    text = "db_password = 'SuperSecretPassword123!'"
    scrubbed = SecretScrubber.scrub(text)
    assert "***REDACTED***" in scrubbed
    assert "SuperSecretPassword123!" not in scrubbed


def test_secret_scrubber_blocked_files():
    assert SecretScrubber.is_blocked_file(".env")
    assert SecretScrubber.is_blocked_file(".env.production")
    assert SecretScrubber.is_blocked_file("id_rsa")
    assert SecretScrubber.is_blocked_file("server.key")
    assert SecretScrubber.is_blocked_file("my_credentials.json")
    assert not SecretScrubber.is_blocked_file("app.py")
    assert not SecretScrubber.is_blocked_file("README.md")


def test_scan_files_skips_blocked_directories():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create allowed file
        good_file = os.path.join(tmpdir, "main.py")
        with open(good_file, "w", encoding="utf-8") as f:
            f.write("def calculate_sum(a, b): return a + b\n")

        # Create file in node_modules
        nm_dir = os.path.join(tmpdir, "node_modules")
        os.makedirs(nm_dir)
        with open(os.path.join(nm_dir, "package.js"), "w", encoding="utf-8") as f:
            f.write("module.exports = {};")

        # Create secret file
        with open(os.path.join(tmpdir, ".env"), "w", encoding="utf-8") as f:
            f.write("SECRET_KEY=123456\n")

        manager = RepositoryManager(tmpdir)
        scanned = manager.scan_files()
        scanned_paths = [s.relative_path for s in scanned]

        assert "main.py" in scanned_paths
        assert not any("node_modules" in p for p in scanned_paths)
        assert not any(".env" in p for p in scanned_paths)
