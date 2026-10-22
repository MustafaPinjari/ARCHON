"""Serializers and input validators for ARCHON 2.0 REST API."""

from rest_framework import serializers


class PathValidateRequestSerializer(serializers.Serializer):
    path = serializers.CharField(required=True, allow_blank=False)


class RepositoryIndexRequestSerializer(serializers.Serializer):
    path = serializers.CharField(required=True, allow_blank=False)
    repo_id = serializers.CharField(required=False, default="default-repo")


class InvestigationRequestSerializer(serializers.Serializer):
    symbol = serializers.CharField(required=True, allow_blank=False)
    question = serializers.CharField(required=True, allow_blank=False)
    repository_path = serializers.CharField(required=False, allow_blank=True, default="")
    is_demo = serializers.BooleanField(required=False, default=False)


class ImpactAnalysisRequestSerializer(serializers.Serializer):
    symbol = serializers.CharField(required=True, allow_blank=False)
    proposed_change = serializers.CharField(required=True, allow_blank=False)
    repository_path = serializers.CharField(required=False, allow_blank=True, default="")
