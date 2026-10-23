"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Database,
  Network,
  Search,
  Maximize2,
  X,
  ArrowDownUp,
  ArrowLeftRight,
} from "lucide-react";

import type { FlowGraphNode, FlowGraphEdge } from "@/lib/types";
import { applyDeterministicLayout } from "@/lib/graphLayout";
import { ArchitectureNode } from "@/components/graph/ArchitectureNode";
import { NodeInspectorPanel } from "@/components/graph/NodeInspectorPanel";

const nodeTypes = {
  architectureNode: ArchitectureNode,
  default: ArchitectureNode,
};

interface ArchitectureGraphProps {
  nodes: FlowGraphNode[];
  edges: FlowGraphEdge[];
  isLiveNeo4j: boolean;
  note?: string;
  onRefresh?: () => void;
  onInvestigateSymbol?: (symbol: string) => void;
}

function ArchitectureGraphContent({
  nodes: rawNodes,
  edges: rawEdges,
  isLiveNeo4j,
  note,
  onRefresh,
  onInvestigateSymbol,
}: ArchitectureGraphProps) {
  const { fitView, setCenter } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Record<string, boolean>>({
    CALLS: true,
    TESTS: true,
    DEFINED_IN: true,
    IMPORTS: true,
  });

  // Collect all available edge types from current dataset
  const availableEdgeTypes = useMemo(() => {
    const types = new Set<string>();
    rawEdges.forEach((e) => {
      if (e.label) types.add(e.label);
    });
    return Array.from(types).sort();
  }, [rawEdges]);

  // Filter edges based on active edge type filters
  const filteredEdges = useMemo(() => {
    return rawEdges.filter((e) => {
      const type = e.label || "CALLS";
      return activeEdgeTypes[type] !== false;
    });
  }, [rawEdges, activeEdgeTypes]);

  // Compute deterministic layout
  const laidOutNodes = useMemo(() => {
    return applyDeterministicLayout(rawNodes, filteredEdges, { direction });
  }, [rawNodes, filteredEdges, direction]);

  // Neighborhood highlighting calculation
  const { displayNodes, displayEdges } = useMemo(() => {
    if (!selectedNodeId) {
      // No selection: standard styling
      const formattedNodes: Node[] = laidOutNodes.map((n) => ({
        ...n,
        type: "architectureNode",
        data: { ...n.data, isSelected: false, isNeighbor: false, isDimmed: false },
      }));

      const formattedEdges: Edge[] = filteredEdges.map((e) => {
        const lbl = e.label || "CALLS";
        const strokeColor =
          lbl === "TESTS"
            ? "#9A6700"
            : lbl === "DEFINED_IN"
            ? "#557945"
            : lbl === "IMPORTS"
            ? "#B45309"
            : "#15370D";

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: e.animated ?? (lbl === "CALLS" || lbl === "TESTS"),
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
          style: { stroke: strokeColor, strokeWidth: 1.5 },
          labelStyle: { fill: "#15370D", fontSize: 10, fontFamily: "monospace", fontWeight: 700 },
          labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.98, stroke: "#E5CD82", strokeWidth: 1 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        };
      });

      return { displayNodes: formattedNodes, displayEdges: formattedEdges };
    }

    // A node is selected: compute 1-hop neighbors
    const neighbors = new Set<string>();
    const incidentEdgeIds = new Set<string>();

    filteredEdges.forEach((e) => {
      if (e.source === selectedNodeId) {
        neighbors.add(e.target);
        incidentEdgeIds.add(e.id);
      } else if (e.target === selectedNodeId) {
        neighbors.add(e.source);
        incidentEdgeIds.add(e.id);
      }
    });

    const formattedNodes: Node[] = laidOutNodes.map((n) => {
      const isSelected = n.id === selectedNodeId;
      const isNeighbor = neighbors.has(n.id);
      const isDimmed = !isSelected && !isNeighbor;

      return {
        ...n,
        type: "architectureNode",
        data: {
          ...n.data,
          isSelected,
          isNeighbor,
          isDimmed,
        },
      };
    });

    const formattedEdges: Edge[] = filteredEdges.map((e) => {
      const isIncident = incidentEdgeIds.has(e.id);
      const lbl = e.label || "CALLS";
      const baseColor =
        lbl === "TESTS"
          ? "#9A6700"
          : lbl === "DEFINED_IN"
          ? "#557945"
          : lbl === "IMPORTS"
          ? "#B45309"
          : "#15370D";

      const strokeColor = isIncident ? baseColor : "#D1C7A7";
      const opacity = isIncident ? 1 : 0.2;

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: isIncident ? e.label : undefined,
        animated: isIncident && (e.animated ?? (lbl === "CALLS" || lbl === "TESTS")),
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
        style: { stroke: strokeColor, strokeWidth: isIncident ? 2 : 1, opacity },
        labelStyle: { fill: "#15370D", fontSize: 10, fontFamily: "monospace", fontWeight: 700 },
        labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.98, stroke: "#E5CD82", strokeWidth: 1 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };
    });

    return { displayNodes: formattedNodes, displayEdges: formattedEdges };
  }, [laidOutNodes, filteredEdges, selectedNodeId]);

  // Auto-fit on initial render and on layout change
  useEffect(() => {
    if (laidOutNodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 400 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [direction, laidOutNodes.length, fitView]);

  // Search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return rawNodes
      .filter((n) => (n.data.name || n.data.label || "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [rawNodes, searchQuery]);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const targetNode = laidOutNodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setCenter(targetNode.position.x + 125, targetNode.position.y + 38, {
          zoom: 1.1,
          duration: 600,
        });
      }
    },
    [laidOutNodes, setCenter]
  );

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    if (params.nodes && params.nodes.length > 0) {
      setSelectedNodeId(params.nodes[0].id);
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => {
    return rawNodes.find((n) => n.id === selectedNodeId) || null;
  }, [rawNodes, selectedNodeId]);

  const toggleEdgeType = (type: string) => {
    setActiveEdgeTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!rawNodes || rawNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[580px] border border-[var(--border-default)] rounded-xl bg-[var(--bg-panel)] p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-cream)] border border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-pine)] mb-3 shadow-xs">
          <Network className="w-6 h-6 text-[var(--brand-pine)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Graph Relationships Indexed</h3>
        <p className="text-xs text-[var(--text-muted)] max-w-md mt-1.5 leading-relaxed">
          Select a repository path in the workspace bar or search an architectural symbol to visualize call hierarchies, caller dependencies, and test guardians.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] text-white transition-colors shadow-xs"
          >
            Load Graph Snapshot
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[640px] border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--bg-app)] flex flex-col select-none shadow-xs">
      {/* Top Workspace Toolbar */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 z-10 shadow-2xs">
        {/* Left: Search & Filter Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Symbol Search Box */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-default)] focus-within:border-[var(--brand-pine)] text-xs">
              <Search className="w-3.5 h-3.5 text-[var(--brand-sage)] shrink-0" />
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-xs w-28 sm:w-40 font-mono font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-md shadow-xl py-1 z-30 max-h-56 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSelectNode(item.id);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="font-mono text-[var(--text-primary)] truncate font-medium">
                      {item.data.name || item.data.label}
                    </span>
                    <span className="text-[10px] font-mono px-1 rounded bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]">
                      {item.data.kind || "sym"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Relationship Filter Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--bg-subtle)] p-0.5 rounded-md border border-[var(--border-subtle)] text-[11px] font-mono">
            {availableEdgeTypes.map((type) => {
              const isActive = activeEdgeTypes[type] !== false;
              const colorDot =
                type === "TESTS"
                  ? "bg-amber-600"
                  : type === "DEFINED_IN"
                  ? "bg-[var(--brand-sage)]"
                  : type === "IMPORTS"
                  ? "bg-amber-700"
                  : "bg-[var(--brand-pine)]";

              return (
                <button
                  key={type}
                  onClick={() => toggleEdgeType(type)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)] shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-70"
                  }`}
                  title={`Toggle ${type} relationship edges`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colorDot}`} />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Layout & View Controls */}
        <div className="flex items-center gap-2">
          {/* Direction Toggle */}
          <button
            onClick={() => setDirection((d) => (d === "TB" ? "LR" : "TB"))}
            className="px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--brand-pine)] border border-[var(--border-default)] text-xs font-mono flex items-center gap-1.5 transition-colors font-medium shadow-xs"
            title={`Switch to ${direction === "TB" ? "Left-to-Right" : "Top-to-Bottom"} layout`}
          >
            {direction === "TB" ? (
              <ArrowDownUp className="w-3.5 h-3.5 text-[var(--brand-pine)]" />
            ) : (
              <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--brand-pine)]" />
            )}
            <span className="hidden md:inline">{direction === "TB" ? "Vertical" : "Horizontal"}</span>
          </button>

          {/* Fit View */}
          <button
            onClick={() => fitView({ padding: 0.15, duration: 400 })}
            className="p-1.5 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--brand-pine)] border border-[var(--border-default)] transition-colors shadow-xs"
            title="Fit graph to canvas"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear Selection */}
          {selectedNodeId && (
            <button
              onClick={handleClearSelection}
              className="px-2 py-1 rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] text-[var(--brand-pine)] text-xs flex items-center gap-1 border border-[var(--brand-gold)] transition-colors font-medium shadow-xs"
              title="Clear active node selection"
            >
              <X className="w-3 h-3" />
              <span>Deselect</span>
            </button>
          )}

          {/* Node & Edge Count Badge */}
          <span className="hidden lg:inline-flex text-[11px] font-mono text-[var(--brand-pine)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md border border-[var(--border-default)] font-semibold shadow-xs">
            {displayNodes.length} Nodes • {displayEdges.length} Edges
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          onSelectionChange={handleSelectionChange}
          onNodeClick={(_, node) => handleSelectNode(node.id)}
          onPaneClick={handleClearSelection}
          fitView
          className="bg-[var(--bg-app)]"
          minZoom={0.15}
          maxZoom={2.0}
        >
          <Background color="#E5CD82" gap={22} size={1} />
          <Controls className="!bg-white !border !border-[var(--border-default)] !rounded-md !shadow-sm overflow-hidden !bottom-3 !left-3" />
          <MiniMap
            nodeColor={(node) => {
              const kind = ((node.data as unknown as FlowGraphNode["data"])?.kind || "").toLowerCase();
              if (kind === "test") return "#B45309";
              if (kind === "class") return "#557945";
              if (kind === "file") return "#15370D";
              return "#09251C";
            }}
            maskColor="rgba(250, 248, 240, 0.85)"
            className="!w-40 !h-28 !bg-white !border !border-[var(--border-default)] !rounded-md !shadow-md overflow-hidden !bottom-3 !right-3"
          />
        </ReactFlow>

        {/* Bottom Status Info Strip */}
        <div className="absolute bottom-3 left-16 z-10 pointer-events-none hidden md:flex items-center gap-2">
          <span
            className={`pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium backdrop-blur shadow-xs ${
              isLiveNeo4j
                ? "bg-[var(--bg-panel)]/95 border border-[var(--brand-sage)] text-[var(--brand-pine)]"
                : "bg-[var(--brand-cream)]/95 border border-[var(--brand-gold)] text-[var(--brand-pine)]"
            }`}
            title={note}
          >
            <Database className="w-3 h-3 text-[var(--brand-sage)]" />
            <span>{isLiveNeo4j ? "Neo4j Knowledge Graph (Live)" : "AST Static Graph (Neo4j Offline)"}</span>
          </span>
        </div>

        {/* Selected Node Right-Side Inspector Panel */}
        {selectedNode && (
          <NodeInspectorPanel
            node={selectedNode}
            allNodes={rawNodes}
            allEdges={rawEdges}
            onSelectNode={handleSelectNode}
            onClose={handleClearSelection}
            onInvestigateSymbol={onInvestigateSymbol}
          />
        )}
      </div>
    </div>
  );
}

export function ArchitectureGraph(props: ArchitectureGraphProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureGraphContent {...props} />
    </ReactFlowProvider>
  );
}
