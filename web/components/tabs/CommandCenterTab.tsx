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
  indexMessage,
  isIndexing,
  onNavigateTab,
  onScanFiles,
  onIndexRepo,
}: CommandCenterTabProps) {
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header section (Calm, technical, no giant neon card) */}
      <div className="p-6 rounded-md bg-[#161b22] border border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>ARCHON 2.0 Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-[#21262d] text-slate-300 border border-[#30363d]">
              v2.0
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Deterministic engineering memory engine combining Python AST parsing, Git commit archaeology, and
            bounded Neo4j GraphRAG. Replaces speculative AI generation with traceable code receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("investigation")}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Launch Investigation</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* System Telemetry Bar (Single consolidated bar, not 4 separate cards) */}
      <div className="rounded-md bg-[#161b22] border border-[#21262d] divide-y sm:divide-y-0 sm:divide-x divide-[#21262d] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>REST API</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>:8000 Online</span>
          </div>
          <p className="text-[11px] text-slate-400">Healthy endpoints active</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Knowledge Graph</span>
            <Database className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.neo4j?.is_connected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span>{health?.neo4j?.is_connected ? "Neo4j Connected" : "In-Memory Mode"}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {health?.neo4j?.is_connected ? health?.neo4j?.uri : "Resilient fallback active"}
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Security Boundary</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Zero-Execution</span>
          </div>
          <p className="text-[11px] text-slate-400">Static AST air-gap invariant</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Truthfulness</span>
            <Award className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>100% Traceable</span>
          </div>
          <p className="text-[11px] text-slate-400">Zero unsupported claims</p>
        </div>
      </div>

      {/* Target Workspace Management Pane */}
      <div className="p-5 rounded-md bg-[#161b22] border border-[#21262d] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Target Workspace</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {repoMode === "demo" ? "Curated Demo Fixture" : "Local Git Directory"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-xs font-mono text-slate-200 truncate select-all">
            {repoMode === "demo"
              ? "github.com/mock-org/aegis-commerce-core (Production Billing Outage INC-8821)"
              : localPath}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onScanFiles}
              className="px-3 py-2 text-xs rounded bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-medium border border-[#30363d] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Scan AST Symbols</span>
            </button>
            <button
              onClick={onIndexRepo}
              disabled={isIndexing}
              className="px-3 py-2 text-xs rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isIndexing ? "Indexing..." : "Index into Graph"}</span>
            </button>
          </div>
        </div>

        {indexMessage && (
          <div className="text-xs text-emerald-400 font-mono bg-emerald-950/40 p-2 rounded border border-emerald-800 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>{indexMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Navigation Workflows (Clean list view, not duplicate cards) */}
      <div className="rounded-md bg-[#161b22] border border-[#21262d] divide-y divide-[#21262d]">
        <div
          onClick={() => onNavigateTab("investigation")}
          className="p-4 hover:bg-[#1c2128] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#21262d] border border-[#30363d] flex items-center justify-center text-sky-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                Engineering Memory Investigation
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand why code was written, review Git blame attribution, and verify assertions with clickable receipts.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab("graph")}
          className="p-4 hover:bg-[#1c2128] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#21262d] border border-[#30363d] flex items-center justify-center text-sky-400 shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                Architecture Call Graph
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect structural React Flow call graphs connecting functions, classes, files, and test guardians.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab("impact")}
          className="p-4 hover:bg-[#1c2128] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#21262d] border border-[#30363d] flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                Change Impact Intelligence
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate regression blast radius across downstream callers and identify mandatory test suites before modifying code.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}
