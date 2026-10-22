"""Curated fictional repository data for ARCHON demo mode.

CRITICAL NOTICE:
All records in this module are clearly flagged as DEMO DATA.
They showcase ARCHON's 4-pillar evidence model without requiring a live external Git repo.
"""

from typing import Dict
from archon.evidence import EvidenceItem, InvestigationResult, PillarType


DEMO_SYMBOLS = [
    "charge_with_idempotency_key",
    "CircuitBreaker.record_failure",
    "calculate_tax_jurisdiction_nexus",
]

DEMO_QUESTIONS = [
    "Why was this function introduced?",
    "Which files depend on this module?",
    "Which commits changed this behavior?",
    "What tests should I inspect before changing this code?",
]


def get_demo_investigation(symbol: str, question: str) -> InvestigationResult:
    """Returns ground-truth demo investigation result with verifiable evidence cards."""
    clean_sym = symbol if symbol in DEMO_SYMBOLS else DEMO_SYMBOLS[0]

    if clean_sym == "charge_with_idempotency_key":
        return _build_idempotency_demo_result(question)
    elif clean_sym == "CircuitBreaker.record_failure":
        return _build_circuit_breaker_demo_result(question)
    else:
        return _build_tax_nexus_demo_result(question)


def _build_idempotency_demo_result(question: str) -> InvestigationResult:
    items = [
        # Pillar 1: Temporal Git Evidence
        EvidenceItem(
            id="GIT-INC-8821",
            pillar=PillarType.TEMPORAL_GIT,
            title="Commit f48b192 — Fix double-charging race during upstream gateway timeout retries",
            location="Commit f48b192 in git history (2024-03-14)",
            summary="Introduced by Senior Engineer Sarah Jenkins after Sev-1 incident INC-8821 where upstream Stripe gateway timeouts caused client SDKs to auto-retry, charging 412 customers twice.",
            verifiable_payload=(
                "commit f48b192a83e098df\n"
                "Author: Sarah Jenkins <sarah.j@hyperledger-mock.org>\n"
                "Date:   Thu Mar 14 02:41:19 2024 -0400\n\n"
                "    fix(billing): add idempotency token hashing to resolve double-charging\n"
                "    \n"
                "    Upstream payment gateway timeout surges (INC-8821) caused client SDKs to\n"
                "    auto-retry charges. Without an idempotency key cache, each retry generated\n"
                "    a new merchant transaction. This commit enforces distributed lock via Redis\n"
                "    and verifies token state before delegating to payment provider.\n"
                "    \n"
                "    Refs: #INC-8821, PR #1402"
            ),
            confidence_label="Direct Git Blame Evidence",
            author="Sarah Jenkins (Principal Engineer)",
            timestamp="2024-03-14 02:41:19 UTC",
            is_verified=True,
        ),
        EvidenceItem(
            id="GIT-PR-1892",
            pillar=PillarType.TEMPORAL_GIT,
            title="Commit 3a719c2 — Extend idempotency TTL from 2h to 24h for ACH reconciliation",
            location="Commit 3a719c2 in git history (2024-08-02)",
            summary="Subsequent patch extending the token cache expiration window to support delayed ACH settlement reconciliation.",
            verifiable_payload=(
                "commit 3a719c2014bb92e1\n"
                "Author: Marcus Brody <marcus.b@hyperledger-mock.org>\n"
                "Date:   Fri Aug 2 16:15:33 2024 -0400\n\n"
                "    perf(billing): extend idempotency TTL from 7200s to 86400s\n"
                "    ACH transfers settle up to 24 hours later; short TTLs caused delayed\n"
                "    webhooks to be misclassified as duplicate new orders."
            ),
            confidence_label="Historical Evolution",
            author="Marcus Brody",
            timestamp="2024-08-02 16:15:33 UTC",
            is_verified=True,
        ),

        # Pillar 2: Contract Invariants
        EvidenceItem(
            id="CONTRACT-DOCSTRING",
            pillar=PillarType.CONTRACT_INVARIANT,
            title="Source Invariant Contract: At-Most-Once Delivery Guarantee",
            location="src/billing/processor.py:Lines 114-138",
            summary="Docstrings and type signatures enforce that all caller services must generate idempotency keys client-side; retrying with a new key is strictly forbidden.",
            verifiable_payload=(
                "def charge_with_idempotency_key(\n"
                "    order_id: str,\n"
                "    amount_cents: int,\n"
                "    idempotency_key: str,\n"
                ") -> PaymentResult:\n"
                '    """Executes a financial charge with strict at-most-once delivery semantics.\n'
                "    \n"
                "    INVARIANTS:\n"
                "    1. `idempotency_key` must be a cryptographically random UUID or SHA-256 hash.\n"
                "    2. Keys expire after 86,400 seconds (24h) in Redis cache.\n"
                "    3. If concurrent requests arrive with the same key, subsequent requests\n"
                "       block on the distributed lock for max 3.5s before yielding 409 Conflict.\n"
                '    """'
            ),
            confidence_label="Source Code AST Contract",
            author="Codebase Definition",
            timestamp="Current Head",
            is_verified=True,
        ),

        # Pillar 3: Verification Mesh
        EvidenceItem(
            id="TEST-IDEMP-01",
            pillar=PillarType.VERIFICATION_TEST,
            title="Regression Guard: Network Timeout Retries Do Not Duplicate Charge",
            location="tests/billing/test_idempotency.py::test_network_timeout_retry_does_not_duplicate_charge",
            summary="Crucial regression test specifically validating that when the 1st request simulates a 504 Gateway Timeout, an immediate 2nd retry reuses the original transaction ID without creating a secondary charge.",
            verifiable_payload=(
                "def test_network_timeout_retry_does_not_duplicate_charge(mock_stripe, redis_client):\n"
                "    # Simulates INC-8821 scenario\n"
                "    key = 'test-idem-key-8821'\n"
                "    mock_stripe.charge.side_effect = [TimeoutError('Gateway Timeout'), {'id': 'ch_123'}]\n"
                "    \n"
                "    # First call fails on network\n"
                "    with pytest.raises(TimeoutError):\n"
                "        processor.charge_with_idempotency_key('ord_1', 5000, key)\n"
                "        \n"
                "    # Second retry must reconcile via idempotency lock, NOT create ch_124\n"
                "    result = processor.charge_with_idempotency_key('ord_1', 5000, key)\n"
                "    assert result.status == 'SETTLED'\n"
                "    assert mock_stripe.charge.call_count == 1"
            ),
            confidence_label="Regression Test Suite",
            author="QA / Reliability Engineering",
            timestamp="CI Verified",
            is_verified=True,
        ),
        EvidenceItem(
            id="TEST-IDEMP-02",
            pillar=PillarType.VERIFICATION_TEST,
            title="Concurrency Test: Parallel Duplicate Requests Reject Secondary",
            location="tests/billing/test_idempotency.py::test_concurrent_duplicate_requests_reject_secondary",
            summary="Ensures thread-safety when two duplicate requests arrive within sub-millisecond windows.",
            verifiable_payload=(
                "def test_concurrent_duplicate_requests_reject_secondary(executor):\n"
                "    key = 'concurrent-key-99'\n"
                "    futures = [executor.submit(processor.charge_with_idempotency_key, 'ord_9', 2000, key) for _ in range(2)]\n"
                "    results = [f.result() for f in futures]\n"
                "    assert any(r.status == 'SUCCESS' for r in results)\n"
                "    assert any(r.status == 'ALREADY_PROCESSING' or r.status == 'CONFLICT' for r in results)"
            ),
            confidence_label="Unit Test Suite",
            author="CI Test Suite",
            timestamp="CI Verified",
            is_verified=True,
        ),

        # Pillar 4: Structural Blast Radius
        EvidenceItem(
            id="DEP-CHECKOUT",
            pillar=PillarType.STRUCTURAL_DEPENDENCY,
            title="Caller 1: E-Commerce Storefront Checkout Workflow",
            location="src/checkout/flow.py:Line 89",
            summary="Main web checkout flow invokes this function with the user's cart token hash.",
            verifiable_payload="from billing.processor import charge_with_idempotency_key\n... result = charge_with_idempotency_key(cart.id, cart.total, cart.idempotency_token)",
            confidence_label="Direct Import Call",
            is_verified=True,
        ),
        EvidenceItem(
            id="DEP-CRON",
            pillar=PillarType.STRUCTURAL_DEPENDENCY,
            title="Caller 2: Recurring Subscription Billing Daemon",
            location="src/subscriptions/renewal_cron.py:Line 45",
            summary="Nightly recurring billing job charges monthly subscribers using hash(user_id + billing_cycle).",
            verifiable_payload="from billing.processor import charge_with_idempotency_key\n... charge_with_idempotency_key(sub.id, sub.price, f'{sub.id}-{cycle}')",
            confidence_label="Direct Import Call",
            is_verified=True,
        ),
    ]

    synthesis = (
        "**Engineering Memory Rationale**:\n"
        "`charge_with_idempotency_key` was introduced on **March 14, 2024** by Principal Engineer Sarah Jenkins "
        "in direct response to high-severity outage **INC-8821**.\n\n"
        "- **The Root Cause**: Payment gateway timeout spikes caused client checkout SDKs to retry failed requests automatically. "
        "Because the legacy endpoint did not track idempotency tokens, each retry generated an independent credit card charge, "
        "double-billing 412 customers in under 20 minutes.\n"
        "- **The Architectural Fix**: A distributed Redis lock ensures that identical idempotency keys block or return existing cached results, "
        "guaranteeing strict at-most-once delivery.\n"
        "- **Blast Radius Warning**: Modifying this function or its timeout semantics directly affects both the **Storefront Checkout Flow** "
        "(`src/checkout/flow.py`) and the **Recurring Subscription Daemon** (`src/subscriptions/renewal_cron.py`). "
        "You **must** run `tests/billing/test_idempotency.py` before modifying this code."
    )

    return InvestigationResult(
        query=question,
        target_symbol="charge_with_idempotency_key",
        repository_path="github.com/mock-org/aegis-commerce-core (DEMO)",
        is_demo=True,
        status_label="DEMO DATA — NOT A LIVE REPOSITORY ANALYSIS",
        synthesis=synthesis,
        items=items,
        capabilities_implemented=[
            "Verifiable Git commit archaeology & blame attribution",
            "Docstring & source AST invariant extraction",
            "Regression test discovery & assertion tracing",
            "Reverse caller blast-radius dependency mapping",
        ],
        capabilities_pending=[
            "Live semantic cross-repository AST call-graph indexing (Planned for M2)",
            "Direct Jira / Linear incident ticket linking (Planned for M2)",
        ],
        recommended_next_steps=[
            "Inspect test suite: tests/billing/test_idempotency.py",
            "Verify Redis distributed lock TTL is at least 86,400s",
            "Do not modify method signature without updating checkout/flow.py",
        ],
    )


def _build_circuit_breaker_demo_result(question: str) -> InvestigationResult:
    items = [
        EvidenceItem(
            id="GIT-CB-01",
            pillar=PillarType.TEMPORAL_GIT,
            title="Commit 7c210ab — Stop cascading TCP connection starvation during microservice brownouts",
            location="Commit 7c210ab in git history (2023-11-09)",
            summary="Implemented by Infrastructure Team lead Alex Vance after an inventory microservice slowdown cascaded into frontend TCP socket pool exhaustion.",
            verifiable_payload=(
                "commit 7c210ab78f02931a\n"
                "Author: Alex Vance <alex.v@hyperledger-mock.org>\n"
                "Date:   Thu Nov 9 14:12:00 2023 -0500\n\n"
                "    resilience(network): implement half-open circuit breaker\n"
                "    When downstream services enter brownouts, waiting for 30s TCP timeouts\n"
                "    starves the entire worker pool. Tripping after 5 failures protects ingress."
            ),
            confidence_label="Direct Git Blame Evidence",
            author="Alex Vance (Infra Lead)",
            timestamp="2023-11-09 14:12:00 UTC",
            is_verified=True,
        ),
        EvidenceItem(
            id="TEST-CB-01",
            pillar=PillarType.VERIFICATION_TEST,
            title="Test Case: Breaker Trips To OPEN State After Threshold Failures",
            location="tests/resilience/test_circuit_breaker.py::test_trips_to_open_after_threshold",
            summary="Verifies that after 5 consecutive downstream errors, subsequent calls fail-fast immediately without establishing TCP handshakes.",
            verifiable_payload="def test_trips_to_open_after_threshold():\n    cb = CircuitBreaker(threshold=5)\n    for _ in range(5): cb.record_failure('inventory_svc', 503)\n    assert cb.is_open('inventory_svc') is True",
            confidence_label="Unit Test Suite",
            author="Infra Reliability",
            timestamp="CI Verified",
            is_verified=True,
        ),
    ]

    synthesis = (
        "**Engineering Memory Rationale**:\n"
        "`CircuitBreaker.record_failure` was designed to halt cascading system failure. "
        "In November 2023, high latency in the downstream inventory microservice caused the main API gateway "
        "to hold TCP sockets open for up to 30 seconds, exhausting worker connections and taking down the entire web cluster. "
        "The circuit breaker forces immediate fail-fast semantics once consecutive failures cross threshold."
    )

    return InvestigationResult(
        query=question,
        target_symbol="CircuitBreaker.record_failure",
        repository_path="github.com/mock-org/aegis-commerce-core (DEMO)",
        is_demo=True,
        status_label="DEMO DATA — NOT A LIVE REPOSITORY ANALYSIS",
        synthesis=synthesis,
        items=items,
        capabilities_implemented=[
            "Verifiable Git commit archaeology & blame attribution",
            "Docstring & source AST invariant extraction",
            "Regression test discovery & assertion tracing",
        ],
        capabilities_pending=[
            "Automated Prometheus telemetry correlation (Planned for M3)",
        ],
        recommended_next_steps=[
            "Check `tests/resilience/test_circuit_breaker.py` before altering threshold logic",
            "Ensure fallback responses are registered for all downstream consumers",
        ],
    )


def _build_tax_nexus_demo_result(question: str) -> InvestigationResult:
    items = [
        EvidenceItem(
            id="GIT-TAX-01",
            pillar=PillarType.TEMPORAL_GIT,
            title="Commit 19028df — South Dakota v. Wayfair economic nexus threshold calculation",
            location="Commit 19028df in git history (2022-07-19)",
            summary="Added by Compliance Engineer Priya Rao to comply with US Supreme Court ruling on remote sales tax collection.",
            verifiable_payload=(
                "commit 19028df81923ab40\n"
                "Author: Priya Rao <priya.r@hyperledger-mock.org>\n"
                "Date:   Tue Jul 19 11:05:00 2022 -0400\n\n"
                "    legal(tax): implement state nexus thresholds for remote sales\n"
                "    Tracks rolling 12-month gross revenue per state to flag economic nexus\n"
                "    at $100k or 200 transactions."
            ),
            confidence_label="Direct Git Blame Evidence",
            author="Priya Rao (Staff Compliance)",
            timestamp="2022-07-19 11:05:00 UTC",
            is_verified=True,
        ),
    ]
    synthesis = (
        "**Engineering Memory Rationale**:\n"
        "`calculate_tax_jurisdiction_nexus` exists strictly to meet legal compliance requirements established "
        "by the US Supreme Court (South Dakota v. Wayfair). It dynamically evaluates transaction volume thresholds per US state."
    )
    return InvestigationResult(
        query=question,
        target_symbol="calculate_tax_jurisdiction_nexus",
        repository_path="github.com/mock-org/aegis-commerce-core (DEMO)",
        is_demo=True,
        status_label="DEMO DATA — NOT A LIVE REPOSITORY ANALYSIS",
        synthesis=synthesis,
        items=items,
        capabilities_implemented=[
            "Verifiable Git commit archaeology & blame attribution",
            "Statutory / Legal rationale tracking",
        ],
        capabilities_pending=[
            "Automated state tax code regulatory API syncing (Planned for M3)",
        ],
        recommended_next_steps=[
            "Do not alter nexus threshold without signoff from Finance/Legal",
        ],
    )
