"""Tests for the Investigator coordinator and zero-hallucination guarantees."""

import os
import subprocess
import tempfile
import pytest
from archon.investigator import Investigator
from archon.evidence import PillarType


def test_investigator_demo_mode():
    inv = Investigator(is_demo=True)
    res = inv.investigate(
        symbol="charge_with_idempotency_key",
        question="Why was this function introduced?",
    )
    assert res.is_demo is True
    assert "DEMO DATA" in res.status_label
    assert any("INC-8821" in item.summary for item in res.items)


def test_investigator_invalid_local_path():
    inv = Investigator(repo_path="C:/Invalid/NonExistent/Folder999", is_demo=False)
    res = inv.investigate(symbol="my_func", question="Why was this function introduced?")
    assert res.is_demo is False
    assert "ERROR" in res.status_label
    assert "Cannot inspect repository" in res.synthesis


def test_investigator_symbol_not_found():
    """Verify that searching for a non-existent symbol outputs 'not found' with explicit limitations."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create dummy file with unrelated code
        with open(os.path.join(tmpdir, "app.py"), "w", encoding="utf-8") as f:
            f.write("def existing_function(): pass\n")

        inv = Investigator(repo_path=tmpdir, is_demo=False)
        res = inv.investigate("GhostSymbolNotFound", "Why was this introduced?")

        assert res.is_demo is False
        assert len(res.items) == 0
        assert "Not found by this search" in res.synthesis
        assert "Searches Executed by Engine" in res.synthesis
        assert "Search Boundaries & Limitations" in res.synthesis


def test_investigator_repository_without_git():
    """Verifies that non-git folders are gracefully handled with an honest synthesis notice."""
    with tempfile.TemporaryDirectory() as tmpdir:
        src_file = os.path.join(tmpdir, "service.py")
        with open(src_file, "w", encoding="utf-8") as f:
            f.write("def calculate_tax(order_id):\n    '''Calculates tax.'''\n    return 0.1\n")

        test_file = os.path.join(tmpdir, "test_service.py")
        with open(test_file, "w", encoding="utf-8") as f:
            f.write("from service import calculate_tax\ndef test_tax():\n    assert calculate_tax(1) == 0.1\n")

        inv = Investigator(repo_path=tmpdir, is_demo=False)
        res = inv.investigate(symbol="calculate_tax", question="What tests should I inspect?")

        assert res.is_demo is False
        assert "LIVE LOCAL REPOSITORY FORENSIC" in res.status_label
        assert "Directory is not a Git repository" in res.synthesis

        # Should discover the test and the definition
        contract_items = res.filter_by_pillar(PillarType.CONTRACT_INVARIANT)
        test_items = res.filter_by_pillar(PillarType.VERIFICATION_TEST)
        assert len(contract_items) >= 1
        assert len(test_items) >= 1

        # Check line accuracy
        assert "Line 1" in contract_items[0].location


def test_investigator_repository_with_git_history():
    """Verifies that a real Git repo produces verified commits, file blame, and real line references."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Initialize Git repo
        subprocess.run(["git", "init"], cwd=tmpdir, capture_output=True, check=True)
        subprocess.run(["git", "config", "user.name", "Archon Tester"], cwd=tmpdir, capture_output=True, check=True)
        subprocess.run(["git", "config", "user.email", "tester@archon.local"], cwd=tmpdir, capture_output=True, check=True)

        # Create source file and commit
        src_path = os.path.join(tmpdir, "auth.py")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write("# Authentication core\n\ndef authenticate_token(token):\n    '''Validates bearer auth token.'''\n    return True\n")

        subprocess.run(["git", "add", "auth.py"], cwd=tmpdir, capture_output=True, check=True)
        subprocess.run(["git", "commit", "-m", "feat: implement authenticate_token core"], cwd=tmpdir, capture_output=True, check=True)

        # Create caller file with import alias and test file
        caller_path = os.path.join(tmpdir, "api.py")
        with open(caller_path, "w", encoding="utf-8") as f:
            f.write("from auth import authenticate_token as auth_fn\n\ndef handle_request():\n    return auth_fn('abc')\n")

        test_path = os.path.join(tmpdir, "test_auth.py")
        with open(test_path, "w", encoding="utf-8") as f:
            f.write("from auth import authenticate_token\n\ndef test_auth():\n    assert authenticate_token('valid') is True\n")

        inv = Investigator(repo_path=tmpdir, is_demo=False)
        res = inv.investigate("authenticate_token", "Why was this function introduced?")

        assert res.is_demo is False
        assert res.total_evidence_count >= 3

        git_items = res.filter_by_pillar(PillarType.TEMPORAL_GIT)
        contract_items = res.filter_by_pillar(PillarType.CONTRACT_INVARIANT)
        test_items = res.filter_by_pillar(PillarType.VERIFICATION_TEST)
        dep_items = res.filter_by_pillar(PillarType.STRUCTURAL_DEPENDENCY)

        # Verify real Git commit was found
        assert len(git_items) >= 1
        assert "implement authenticate_token core" in git_items[0].title

        # Verify exact line references
        assert len(contract_items) >= 1
        assert "auth.py:Line 3" in contract_items[0].location
        assert "Validates bearer auth token" in contract_items[0].verifiable_payload

        # Verify test assertion discovered
        assert len(test_items) >= 1
        assert "test_auth.py" in test_items[0].location

        # Verify caller and alias detected
        assert len(dep_items) >= 1
        assert "api.py" in dep_items[0].location


def test_investigator_real_bahub_if_present():
    """Live verification against user's actual BAHub repository if present on system."""
    bahub_path = r"C:\Users\mustafa\Desktop\BAHub"
    if not os.path.exists(bahub_path):
        pytest.skip("BAHub repository not present at target path")

    inv = Investigator(repo_path=bahub_path, is_demo=False)
    res = inv.investigate("TenantSubscription", "Why does this exist?")

    assert res.is_demo is False
    assert res.total_evidence_count > 5
    assert "backend/billing/models.py:Line 4" in res.synthesis

    # Check Git commits verified
    git_items = res.filter_by_pillar(PillarType.TEMPORAL_GIT)
    assert len(git_items) > 0

    # Check test suites verified
    test_items = res.filter_by_pillar(PillarType.VERIFICATION_TEST)
    assert len(test_items) > 0

    # Check callers verified
    dep_items = res.filter_by_pillar(PillarType.STRUCTURAL_DEPENDENCY)
    assert len(dep_items) > 0
