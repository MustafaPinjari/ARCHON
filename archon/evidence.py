"""Evidence models and formatting utilities for ARCHON.

ARCHON produces verifiable receipts across 4 pillars:
1. Temporal Git History
2. Source Code Contracts & Invariants
3. Verification / Test Suite Mesh
4. Structural Call Graph & Dependencies
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any


class PillarType(str, Enum):
    """The 4 pillars of engineering memory evidence."""
    TEMPORAL_GIT = "Temporal Intent (Git History)"
    CONTRACT_INVARIANT = "Architectural Contract (Docstrings & Code)"
    VERIFICATION_TEST = "Verification Mesh (Test Evidence)"
    STRUCTURAL_DEPENDENCY = "Blast Radius (Structural Dependencies)"


@dataclass
class EvidenceItem:
    """An empirical receipt supporting an engineering memory conclusion."""
    id: str
    pillar: PillarType
    title: str
    location: str
    summary: str
    verifiable_payload: str
    confidence_label: str = "Direct Evidence"
    author: Optional[str] = None
    timestamp: Optional[str] = None
    is_verified: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "pillar": self.pillar.value,
            "title": self.title,
            "location": self.location,
            "summary": self.summary,
            "verifiable_payload": self.verifiable_payload,
            "confidence_label": self.confidence_label,
            "author": self.author,
            "timestamp": self.timestamp,
            "is_verified": self.is_verified,
        }


@dataclass
class InvestigationResult:
    """Complete synthesized engineering memory report."""
    query: str
    target_symbol: str
    repository_path: str
    is_demo: bool
    status_label: str
    synthesis: str
    items: List[EvidenceItem] = field(default_factory=list)
    capabilities_implemented: List[str] = field(default_factory=list)
    capabilities_pending: List[str] = field(default_factory=list)
    recommended_next_steps: List[str] = field(default_factory=list)

    @property
    def total_evidence_count(self) -> int:
        return len(self.items)

    def filter_by_pillar(self, pillar: PillarType) -> List[EvidenceItem]:
        return [item for item in self.items if item.pillar == pillar]

    def get_pillar_counts(self) -> Dict[str, int]:
        """Return the count of evidence items under each of the 4 pillars."""
        counts = {p.value: 0 for p in PillarType}
        for item in self.items:
            key = item.pillar.value if isinstance(item.pillar, PillarType) else str(item.pillar)
            counts[key] = counts.get(key, 0) + 1
        return counts

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "target_symbol": self.target_symbol,
            "repository_path": self.repository_path,
            "is_demo": self.is_demo,
            "status_label": self.status_label,
            "synthesis": self.synthesis,
            "items": [item.to_dict() for item in self.items],
            "pillar_counts": self.get_pillar_counts(),
            "capabilities_implemented": self.capabilities_implemented,
            "capabilities_pending": self.capabilities_pending,
            "recommended_next_steps": self.recommended_next_steps,
        }

