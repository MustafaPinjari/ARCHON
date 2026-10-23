"use client";

import React from "react";
import {
  Activity,
  Database,
  Shield,
  Award,
  FolderGit2,
  ChevronRight,
  RefreshCw,
  Search,
  Network,
  AlertTriangle,
} from "lucide-react";
import type { HealthStatus, ValidationResponse, RepoMode, TabId } from "@/lib/types";

interface CommandCenterTabProps {
  health: HealthStatus | null;
  repoMode: RepoMode;
  localPath: string;
  validation: ValidationResponse | null;
  indexMessage: string | null;
  isIndexing: boolean;
  onNavigateTab: (tab: TabId) => void;
  onScanFiles: () => void;
  onIndexRepo: () => void;
}

export function CommandCenterTab({
  health,
  repoMode,
  localPath,
  validation,
  indexMessage,
  isIndexing,
  onNavigateTab,
  onScanFiles,
  onIndexRepo,
}: CommandCenterTabProps) {
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="p-6 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span>ARCHON 2.0 Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]">
              v2.0
            </span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
            Deterministic engineering memory engine combining Python AST parsing, Git commit archaeology, and
            bounded Neo4j GraphRAG. Replaces speculative AI generation with traceable code receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("investigation")}
          className="px-4 py-2 rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] text-xs font-semibold text-white transition-colors flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
        >
          <span>Launch Investigation</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* System Telemetry Bar */}
      <div className="rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs shadow-xs">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>REST API</span>
            <Activity className="w-3.5 h-3.5 text-[var(--brand-pine)]" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-pine)]" />
            <span>:8000 Online</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Healthy endpoints active</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Knowledge Graph</span>
            <Database className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] font-mono flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.neo4j?.is_connected ? "bg-[var(--brand-pine)]" : "bg-amber-600"
              }`}
            />
            <span>{health?.neo4j?.is_connected ? "Neo4j Connected" : "In-Memory Mode"}</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {health?.neo4j?.is_connected ? health?.neo4j?.uri : "Resilient fallback active"}
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Security Boundary</span>
            <Shield className="w-3.5 h-3.5 text-[var(--brand-pine)]" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-pine)]" />
            <span>Zero-Execution</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Static AST air-gap invariant</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Truthfulness</span>
            <Award className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-sage)]" />
            <span>100% Traceable</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Zero unsupported claims</p>
        </div>
      </div>

      {/* Target Workspace Management Pane */}
      <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <FolderGit2 className="w-3.5 h-3.5 text-[var(--brand-pine)]" />
            <span>Active Target Workspace</span>
          </h3>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {repoMode === "demo"
              ? "Curated Demo Fixture"
              : validation?.is_remote
              ? "Remote Public Repository (Git)"
              : "Local Git Directory"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 bg-[var(--bg-subtle)] p-2.5 rounded-md border border-[var(--border-default)] text-xs font-mono text-[var(--text-primary)] truncate select-all">
            {repoMode === "demo" ? (
              "github.com/mock-org/aegis-commerce-core (Production Billing Outage INC-8821)"
            ) : validation?.is_remote ? (
              <div className="space-y-0.5">
                <div className="font-semibold text-[var(--brand-pine)]">{validation.remote_url || localPath}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">Cached: {validation.resolved_path}</div>
              </div>
            ) : (
              localPath
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onScanFiles}
              className="px-3 py-2 text-xs rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] text-[var(--brand-pine)] font-medium border border-[var(--brand-gold)] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Scan AST Symbols</span>
            </button>
            <button
              onClick={onIndexRepo}
              disabled={isIndexing}
              className="px-3 py-2 text-xs rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isIndexing ? "Indexing..." : "Index into Graph"}</span>
            </button>
          </div>
        </div>

        {indexMessage && (
          <div className="text-xs text-[var(--brand-pine)] font-mono bg-[var(--brand-cream)] p-2 rounded-md border border-[var(--brand-gold)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pine)] shrink-0" />
            <span>{indexMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Navigation Workflows */}
      <div className="rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] divide-y divide-[var(--border-subtle)] shadow-xs overflow-hidden">
        <div
          onClick={() => onNavigateTab("investigation")}
          className="p-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-cream)] border border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-pine)] shrink-0 shadow-2xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] transition-colors">
                Engineering Memory Investigation
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Understand why code was written, review Git blame attribution, and verify assertions with clickable receipts.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] transition-colors shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab("graph")}
          className="p-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-cream)] border border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-pine)] shrink-0 shadow-2xs">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] transition-colors">
                Architecture Dependency Graph
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Inspect structural React Flow call graphs connecting functions, classes, files, and test guardians.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] transition-colors shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab("impact")}
          className="p-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-cream)] border border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-pine)] shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] transition-colors">
                Change Impact Intelligence
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Calculate regression blast radius across downstream callers and identify mandatory test suites before modifying code.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}
