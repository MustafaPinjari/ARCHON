"use client";

import React from "react";
import {
  X,
  Code2,
  FileText,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  Compass,
  FileCode,
} from "lucide-react";
import type { FlowGraphNode, FlowGraphEdge } from "@/lib/types";

interface NodeInspectorPanelProps {
  node: FlowGraphNode | null;
  allNodes: FlowGraphNode[];
  allEdges: FlowGraphEdge[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
  onInvestigateSymbol?: (symbol: string) => void;
}

export function NodeInspectorPanel({
  node,
  allNodes,
  allEdges,
  onSelectNode,
  onClose,
  onInvestigateSymbol,
}: NodeInspectorPanelProps) {
  if (!node) return null;

  const nodeMap = new Map<string, FlowGraphNode>();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  const data = node.data;
  const symbol = data.name || data.label || node.id;

  // Find genuine incoming callers
  const incomingCalls = allEdges
    .filter((e) => e.target === node.id && e.label === "CALLS")
    .map((e) => ({
      edge: e,
      caller: nodeMap.get(e.source),
    }))
    .filter((item): item is { edge: FlowGraphEdge; caller: FlowGraphNode } => !!item.caller);

  // Find genuine outgoing calls
  const outgoingCalls = allEdges
    .filter((e) => e.source === node.id && e.label === "CALLS")
    .map((e) => ({
      edge: e,
      callee: nodeMap.get(e.target),
    }))
    .filter((item): item is { edge: FlowGraphEdge; callee: FlowGraphNode } => !!item.callee);

  // Find genuine tests guarding or testing this node
  const relatedTests = allEdges
    .filter((e) => (e.target === node.id || e.source === node.id) && e.label === "TESTS")
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      return {
        edge: e,
        testNode: nodeMap.get(otherId),
      };
    })
    .filter((item): item is { edge: FlowGraphEdge; testNode: FlowGraphNode } => !!item.testNode);

  return (
    <div className="absolute top-14 right-3 bottom-3 w-84 sm:w-96 bg-[var(--bg-panel)]/98 backdrop-blur border border-[var(--border-default)] rounded-xl shadow-xl z-20 flex flex-col overflow-hidden text-[var(--text-primary)]">
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-2 bg-[var(--bg-subtle)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]">
              {data.kind || "symbol"}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">Node Inspector</span>
          </div>
          <h4 className="text-sm font-semibold font-mono text-[var(--text-primary)] truncate" title={symbol}>
            {symbol}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-sans">
        {/* Location & Provenance Card */}
        <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-pine)]">
            <FileCode className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
            <span>Source Declaration</span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-primary)] break-all font-medium">
            {data.filePath || "Source location unindexed"}
          </div>
          {data.lineStart && (
            <div className="text-[10px] font-mono text-[var(--text-muted)]">
              Lines: {data.lineStart} {data.lineEnd ? `– ${data.lineEnd}` : ""}
            </div>
          )}
        </div>

        {/* Signature & Docstring */}
        {data.signature && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Signature</span>
            </div>
            <pre className="p-2 rounded-md bg-[var(--bg-code)] border border-[var(--border-subtle)] text-[10.5px] font-mono text-[var(--brand-pine)] overflow-x-auto leading-relaxed font-semibold">
              {data.signature}
            </pre>
          </div>
        )}

        {data.docstring && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Docstring Invariant</span>
            </div>
            <div className="p-2 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] leading-relaxed max-h-28 overflow-y-auto">
              {data.docstring}
            </div>
          </div>
        )}

        {/* Incoming Callers */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--brand-pine)]">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Incoming Callers ({incomingCalls.length})</span>
            </span>
          </div>
          {incomingCalls.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] italic">No incoming callers detected in current scope.</p>
          ) : (
            <div className="space-y-1">
              {incomingCalls.map(({ caller }) => (
                <button
                  key={caller.id}
                  onClick={() => onSelectNode(caller.id)}
                  className="w-full text-left p-1.5 rounded-md bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-colors flex items-center justify-between gap-2 group shadow-xs"
                >
                  <span className="font-mono text-[11px] text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] font-medium truncate">
                    {caller.data.name || caller.data.label}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] font-semibold shrink-0">
                    Focus →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Calls */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--brand-pine)]">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Outgoing Dependencies ({outgoingCalls.length})</span>
            </span>
          </div>
          {outgoingCalls.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] italic">No downstream symbol calls detected.</p>
          ) : (
            <div className="space-y-1">
              {outgoingCalls.map(({ callee }) => (
                <button
                  key={callee.id}
                  onClick={() => onSelectNode(callee.id)}
                  className="w-full text-left p-1.5 rounded-md bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--brand-gold)] transition-colors flex items-center justify-between gap-2 group shadow-xs"
                >
                  <span className="font-mono text-[11px] text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] font-medium truncate">
                    {callee.data.name || callee.data.label}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] font-semibold shrink-0">
                    Focus →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Related Tests */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--brand-pine)]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Test Guardians ({relatedTests.length})</span>
            </span>
          </div>
          {relatedTests.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] italic">No direct test references mapped in current graph.</p>
          ) : (
            <div className="space-y-1">
              {relatedTests.map(({ testNode }) => (
                <button
                  key={testNode.id}
                  onClick={() => onSelectNode(testNode.id)}
                  className="w-full text-left p-1.5 rounded-md bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200 transition-colors flex items-center justify-between gap-2 group shadow-xs"
                >
                  <span className="font-mono text-[11px] text-amber-950 font-medium truncate">
                    {testNode.data.name || testNode.data.label}
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold shrink-0">
                    Focus →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-2">
        {onInvestigateSymbol && (
          <button
            onClick={() => onInvestigateSymbol(symbol)}
            className="w-full py-1.5 px-3 rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Investigate Symbol in Workspace</span>
          </button>
        )}
      </div>
    </div>
  );
}
