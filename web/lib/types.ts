import type { ComponentType } from "react";

export type TabId =
  | "command"
  | "explorer"
  | "investigation"
  | "graph"
  | "impact"
  | "evaluation";

export type EvidenceTabId = "git" | "contract" | "test" | "blast";

export type RepoMode = "demo" | "local";

export interface NavItem {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface SecurityHealth {
  zero_code_execution: boolean;
  secret_scrubber_active: boolean;
  offline_boundary_enforced: boolean;
}

export interface Neo4jHealth {
  is_connected: boolean;
  uri: string;
  message: string;
  database: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  service: string;
  security: SecurityHealth;
  neo4j: Neo4jHealth;
}

export interface ValidationResponse {
  is_valid: boolean;
  resolved_path: string;
  is_git_repo: boolean;
  git_branch: string | null;
  error_message: string | null;
  scanned_files_count: number;
  is_remote?: boolean;
  remote_url?: string | null;
}

export interface IndexResponse {
  repo_id: string;
  resolved_path: string;
  files_indexed: number;
  symbols_indexed: number;
  calls_indexed: number;
  neo4j_status: {
    status: string;
    nodes_ingested: number;
    message?: string;
  };
}

export interface SymbolItem {
  name: string;
  kind: string;
  file_path?: string;
  line?: number;
  signature?: string;
}

export interface EvidenceItem {
  id: string;
  pillar: string;
  title: string;
  location: string;
  summary: string;
  verifiable_payload: string;
  confidence_label: string;
  author?: string;
  timestamp?: string;
  is_verified: boolean;
}

export interface GraphCaller {
  name: string;
  file_path: string;
  line: number;
}

export interface GraphTest {
  name: string;
  file_path: string;
  line: number;
}

export interface GraphCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface GraphContextData {
  nodes?: Array<{
    id: string;
    label: string;
    [key: string]: unknown;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    type: string;
    [key: string]: unknown;
  }>;
  summary?: string;
  callers?: GraphCaller[];
  tests?: GraphTest[];
  commits?: GraphCommit[];
  is_live_graph?: boolean;
}

export interface InvestigationResult {
  query: string;
  target_symbol: string;
  repository_path: string;
  is_demo: boolean;
  status_label: string;
  synthesis: string;
  items: EvidenceItem[];
  capabilities_implemented: string[];
  capabilities_pending: string[];
  recommended_next_steps: string[];
  graph_context?: GraphContextData;
}

export interface FlowGraphNodeData {
  label: string;
  name?: string;
  kind?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  signature?: string;
  docstring?: string;
  isSelected?: boolean;
  isNeighbor?: boolean;
  isDimmed?: boolean;
  [key: string]: unknown;
}

export interface FlowGraphNode {
  id: string;
  type?: string;
  data: FlowGraphNodeData;
  position: { x: number; y: number };
}

export interface FlowGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  [key: string]: unknown;
}

export interface FlowGraph {
  nodes: FlowGraphNode[];
  edges: FlowGraphEdge[];
  is_live_neo4j: boolean;
  note?: string;
}

export interface AffectedComponent {
  name: string;
  file_path: string;
  line_number: number;
  relationship_kind: string;
  risk_level: string;
  rationale: string;
  recommended_action: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ImpactReport {
  target_symbol: string;
  proposed_change: string;
  repository_path: string;
  overall_risk: RiskLevel | string;
  affected_components: AffectedComponent[];
  tests_to_run: string[];
  historical_commit_count: number;
  missing_evidence_notes: string[];
  is_advisory_only: boolean;
}

export interface ImpactAnalysisResult {
  target_symbol: string;
  affected_files: string[];
  direct_callers: string[];
  affected_tests: string[];
  overall_risk: RiskLevel;
  risk_reason: string;
  is_advisory_only: boolean;
}

export interface EvaluationCaseResult {
  case_id: string;
  symbol: string;
  is_success: boolean;
  latency_ms: number;
  evidence_count: number;
  citation_validity_rate: number;
  precision_rate: number;
  support_rate: number;
  unsupported_claims_count: number;
  notes: string;
}

export interface EvaluationSummary {
  evaluation_timestamp: string;
  total_cases_evaluated: number;
  average_latency_ms: number;
  average_precision_rate: number;
  average_citation_validity: number;
  average_answer_support_rate: number;
  total_unsupported_claims: number;
  failure_rate_percent: number;
  results: EvaluationCaseResult[];
}
