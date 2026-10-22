"""URL routing for ARCHON v1 REST API."""

from django.urls import path
from api.views import (
    HealthCheckView,
    ValidateRepositoryView,
    IndexRepositoryView,
    RepositorySymbolsView,
    InvestigationView,
    RepositoryGraphView,
    ImpactAnalysisView,
    EvaluationView,
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('repositories/validate/', ValidateRepositoryView.as_view(), name='validate-repo'),
    path('repositories/index/', IndexRepositoryView.as_view(), name='index-repo'),
    path('repositories/symbols/', RepositorySymbolsView.as_view(), name='repo-symbols'),
    path('repositories/graph/', RepositoryGraphView.as_view(), name='repo-graph'),
    path('investigations/', InvestigationView.as_view(), name='investigations'),
    path('impact-analysis/', ImpactAnalysisView.as_view(), name='impact-analysis'),
    path('evaluation/', EvaluationView.as_view(), name='evaluation'),
]
