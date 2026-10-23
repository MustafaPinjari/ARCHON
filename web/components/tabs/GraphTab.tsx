"use client";

import React from "react";
import { Network, RefreshCw } from "lucide-react";
import { ArchitectureGraph } from "@/components/ArchitectureGraph";
import type { FlowGraph } from "@/lib/types";

interface GraphTabProps {
  graphData: FlowGraph | null;
  isGraphLoading: boolean;
  onRefreshGraph: () => void;
  onInvestigateSymbol?: (symbol: string) => void;
}

export function GraphTab({
  graphData,
  isGraphLoading,
  onRefreshGraph,
  onInvestigateSymbol,
}: GraphTabProps) {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-400" />
            <span>Interactive Architecture Dependency Graph</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified structural topology mapping symbol declarations, inter-procedural CALLS, and test guardian relationships.
          </p>
        </div>
        <button
          onClick={onRefreshGraph}
          disabled={isGraphLoading}
          className="px-3 py-1.5 text-xs rounded-md bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-slate-200 font-medium border border-[#30363d] flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGraphLoading ? "animate-spin text-sky-400" : "text-slate-400"}`} />
          <span>Refresh Snapshot</span>
        </button>
      </div>

      <ArchitectureGraph
        nodes={graphData?.nodes || []}
        edges={graphData?.edges || []}
        isLiveNeo4j={graphData?.is_live_neo4j || false}
        note={graphData?.note}
        onRefresh={onRefreshGraph}
        onInvestigateSymbol={onInvestigateSymbol}
      />
    </div>
  );
}
