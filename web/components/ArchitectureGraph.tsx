"use client";

import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface ArchitectureGraphProps {
  nodes: Node[];
  edges: Edge[];
  isLiveNeo4j: boolean;
  onRefresh?: () => void;
}

export function ArchitectureGraph({
  nodes,
  edges,
  isLiveNeo4j,
  onRefresh,
}: ArchitectureGraphProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-slate-800 rounded-lg bg-slate-950/60 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3">
          🕸️
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Graph Relationships Indexed</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          Select a repository and index files to visualize code symbols, call hierarchies, and test guardians in the Neo4j Knowledge Graph.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-1.5 text-xs font-medium rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Load Graph Snapshot
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] border border-slate-800 rounded-lg overflow-hidden bg-[#0a0f1d]">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isLiveNeo4j
              ? "bg-emerald-950/80 border border-emerald-600 text-emerald-300"
              : "bg-amber-950/80 border border-amber-600 text-amber-300"
          }`}
        >
          {isLiveNeo4j ? "🟢 Neo4j Live Knowledge Graph" : "🟡 In-Memory AST Static Graph (Neo4j Offline)"}
        </span>
        <span className="text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          {nodes.length} Nodes • {edges.length} Edges
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-[#090d16]"
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background color="#1e293b" gap={16} />
        <Controls className="bg-slate-900 border-slate-800 fill-slate-300" />
        <MiniMap
          nodeColor="#06b6d4"
          maskColor="rgba(9, 13, 22, 0.7)"
          className="bg-slate-950 border border-slate-800"
        />
      </ReactFlow>
    </div>
  );
}
