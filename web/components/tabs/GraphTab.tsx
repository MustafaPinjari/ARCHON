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
      <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Network className="w-4 h-4 text-[var(--brand-pine)]" />
            <span>Interactive Architecture Dependency Graph</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Verified structural topology mapping symbol declarations, inter-procedural CALLS, and test guardian relationships.
          </p>
        </div>
        <button
          onClick={onRefreshGraph}
          disabled={isGraphLoading}
          className="px-3 py-1.5 text-xs rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] disabled:opacity-50 text-[var(--brand-pine)] font-medium border border-[var(--brand-gold)] flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGraphLoading ? "animate-spin text-[var(--brand-pine)]" : "text-[var(--brand-sage)]"}`} />
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
