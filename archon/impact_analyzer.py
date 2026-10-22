"""Change Impact Analyzer for ARCHON 2.0.

Evaluates proposed modifications to code components:
- Direct caller detection
- Downstream import propagation
- Test coverage requirements
- Historical commit volatility
- Blast radius criticality advisory
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from archon.repository import RepositoryManager
from archon.neo4j_graph import Neo4jGraphService


@dataclass
class ImpactedComponent:
    name: str
    file_path: str
    line_number: int
    relationship_kind: str  # "CALLS", "IMPORTS", "INHERITS", "TESTS"
    risk_level: str         # "HIGH", "MEDIUM", "LOW"
    rationale: str
    recommended_action: str


@dataclass
class ChangeImpactReport:
    target_symbol: str
    proposed_change: str
    repository_path: str
    overall_risk: str
    affected_components: List[ImpactedComponent] = field(default_factory=list)
    tests_to_run: List[str] = field(default_factory=list)
    historical_commit_count: int = 0
    missing_evidence_notes: List[str] = field(default_factory=list)
    is_advisory_only: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "target_symbol": self.target_symbol,
            "proposed_change": self.proposed_change,
            "repository_path": self.repository_path,
            "overall_risk": self.overall_risk,
            "affected_components": [
                {
                    "name": c.name,
                    "file_path": c.file_path,
                    "line_number": c.line_number,
                    "relationship_kind": c.relationship_kind,
                    "risk_level": c.risk_level,
                    "rationale": c.rationale,
                    "recommended_action": c.recommended_action,
                }
                for c in self.affected_components
            ],
            "tests_to_run": self.tests_to_run,
            "historical_commit_count": self.historical_commit_count,
            "missing_evidence_notes": self.missing_evidence_notes,
            "is_advisory_only": True,
        }


class ChangeImpactEngine:
    """Evaluates the structural and historical blast radius of changing a symbol."""

    def __init__(self, repo_path: str, neo4j_service: Optional[Neo4jGraphService] = None):
        self.repo_path = repo_path
        self.mgr = RepositoryManager(repo_path)
        self.neo4j = neo4j_service or Neo4jGraphService()

    def analyze_impact(self, symbol: str, proposed_change_description: str) -> ChangeImpactReport:
        clean_symbol = symbol.strip()
        val = self.mgr.validation

        if not val.is_valid:
            return ChangeImpactReport(
                target_symbol=clean_symbol,
                proposed_change=proposed_change_description,
                repository_path=self.repo_path,
                overall_risk="UNKNOWN",
                missing_evidence_notes=[f"Cannot access repository path: {val.error_message}"],
            )

        # 1. Search symbol in source code
        sym_results = self.mgr.search_symbol(clean_symbol)

        # 2. Query historical volatility
        commits, _ = self.mgr.search_git_symbol(clean_symbol, limit=10)
        commit_count = len(commits)

        affected: List[ImpactedComponent] = []
        tests_to_run = [t.relative_path for t in sym_results.direct_tests] + sym_results.indirect_test_suites

        # Process callers
        for c in sym_results.callers:
            risk = "HIGH" if c.category == "import" else "MEDIUM"
            action = (
                f"Verify parameter compatibility in `{c.relative_path}:Line {c.line_number}`."
                if c.category != "import"
                else f"Check exported symbols in `{c.relative_path}`."
            )
            affected.append(
                ImpactedComponent(
                    name=clean_symbol,
                    file_path=c.relative_path,
                    line_number=c.line_number,
                    relationship_kind=c.category.upper(),
                    risk_level=risk,
                    rationale=f"Directly invokes or imports '{clean_symbol}'.",
                    recommended_action=action,
                )
            )

        # Determine overall risk
        if not tests_to_run:
            overall_risk = "HIGH"
            missing_notes = [
                "Zero automated test coverage identified. Modifying this symbol carries critical regression hazard.",
                "Recommend creating unit tests prior to initiating changes.",
            ]
        elif len(affected) > 10:
            overall_risk = "HIGH"
            missing_notes = [
                f"High blast radius: {len(affected)} downstream callers detected across repository.",
            ]
        elif len(affected) > 2:
            overall_risk = "MEDIUM"
            missing_notes = [
                f"Moderate blast radius: {len(affected)} callers require regression testing.",
            ]
        else:
            overall_risk = "LOW"
            missing_notes = [
                "Isolated component with localized callers.",
            ]

        if commit_count > 5:
            missing_notes.append(
                f"Historical volatility alert: Modified in {commit_count} recent commits. Check past PRs for edge cases."
            )

        return ChangeImpactReport(
            target_symbol=clean_symbol,
            proposed_change=proposed_change_description,
            repository_path=val.resolved_path,
            overall_risk=overall_risk,
            affected_components=affected[:20],
            tests_to_run=sorted(list(set(tests_to_run))),
            historical_commit_count=commit_count,
            missing_evidence_notes=missing_notes,
            is_advisory_only=True,
        )
