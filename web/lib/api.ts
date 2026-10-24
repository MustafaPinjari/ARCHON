/**
 * ARCHON 2.0 REST API Client
 * Connects Next.js Frontend to Django REST Backend (:8000)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type {
  HealthStatus,
  ValidationResponse,
  IndexResponse,
  SymbolItem,
  EvidenceItem,
  InvestigationResult,
  FlowGraph,
  FlowGraphNode,
  FlowGraphEdge,
  ImpactReport,
  AffectedComponent,
  EvaluationSummary,
  EvaluationCaseResult,
  GraphContextData,
  ImpactAnalysisResult,
  TabId,
  EvidenceTabId,
  RepoMode,
} from "./types";

import type {
  HealthStatus,
  ValidationResponse,
  IndexResponse,
  SymbolItem,
  InvestigationResult,
  FlowGraph,
  ImpactReport,
  EvaluationSummary,
} from "./types";

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/health/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function validateRepository(path: string): Promise<ValidationResponse> {
  const res = await fetch(`${API_BASE_URL}/repositories/validate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`Path validation failed: ${res.statusText}`);
  return res.json();
}

export async function indexRepository(path: string, repoId: string = "default-repo"): Promise<IndexResponse> {
  const res = await fetch(`${API_BASE_URL}/repositories/index/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, repo_id: repoId }),
  });
  if (!res.ok) throw new Error(`Indexing failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSymbols(path: string): Promise<{ symbols: SymbolItem[] }> {
  const url = path ? `${API_BASE_URL}/repositories/symbols/?path=${encodeURIComponent(path)}` : `${API_BASE_URL}/repositories/symbols/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.statusText}`);
  return res.json();
}

export async function runInvestigation(params: {
  symbol: string;
  question: string;
  repository_path?: string;
  is_demo?: boolean;
}): Promise<InvestigationResult> {
  const cleanPayload = {
    symbol: typeof params?.symbol === "string" ? params.symbol : String(params?.symbol || ""),
    question: typeof params?.question === "string" ? params.question : String(params?.question || ""),
    repository_path: typeof params?.repository_path === "string" ? params.repository_path : "",
    is_demo: Boolean(params?.is_demo),
  };
  const res = await fetch(`${API_BASE_URL}/investigations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload),
  });
  if (!res.ok) throw new Error(`Investigation request failed: ${res.statusText}`);
  return res.json();
}

export async function fetchGraph(path?: string, symbol?: string, repoId: string = "default-repo"): Promise<FlowGraph> {
  const params = new URLSearchParams();
  if (path && typeof path === "string") params.set("path", path);
  if (symbol && typeof symbol === "string") params.set("symbol", symbol);
  params.set("repo_id", repoId);

  const res = await fetch(`${API_BASE_URL}/repositories/graph/?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Graph retrieval failed: ${res.statusText}`);
  return res.json();
}

export async function runImpactAnalysis(params: {
  symbol: string;
  proposed_change: string;
  repository_path?: string;
}): Promise<ImpactReport> {
  const cleanPayload = {
    symbol: typeof params?.symbol === "string" ? params.symbol : String(params?.symbol || ""),
    proposed_change: typeof params?.proposed_change === "string" ? params.proposed_change : String(params?.proposed_change || ""),
    repository_path: typeof params?.repository_path === "string" ? params.repository_path : "",
  };
  const res = await fetch(`${API_BASE_URL}/impact-analysis/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload),
  });
  if (!res.ok) throw new Error(`Impact analysis failed: ${res.statusText}`);
  return res.json();
}

export async function fetchEvaluation(): Promise<EvaluationSummary> {
  const res = await fetch(`${API_BASE_URL}/evaluation/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch evaluation metrics: ${res.statusText}`);
  return res.json();
}
