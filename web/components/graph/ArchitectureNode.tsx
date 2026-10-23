"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Box, Code2, ShieldCheck, FileCode, Cpu } from "lucide-react";
import type { FlowGraphNodeData } from "@/lib/types";

function ArchitectureNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as FlowGraphNodeData;
  const kind = (nodeData.kind || "symbol").toLowerCase();
  const isSelected = selected || nodeData.isSelected;
  const isNeighbor = nodeData.isNeighbor;
  const isDimmed = nodeData.isDimmed;

  // Semantic Kind Config
  const kindConfig = (() => {
    switch (kind) {
      case "class":
        return {
          icon: Box,
          label: "class",
          badgeClass: "text-purple-300 bg-purple-950/70 border-purple-800/60",
          accentBar: "bg-purple-500",
        };
      case "test":
        return {
          icon: ShieldCheck,
          label: "test",
          badgeClass: "text-amber-300 bg-amber-950/70 border-amber-800/60",
          accentBar: "bg-amber-500",
        };
      case "file":
        return {
          icon: FileCode,
          label: "file",
          badgeClass: "text-emerald-300 bg-emerald-950/70 border-emerald-800/60",
          accentBar: "bg-emerald-500",
        };
      case "method":
        return {
          icon: Code2,
          label: "method",
          badgeClass: "text-indigo-300 bg-indigo-950/70 border-indigo-800/60",
          accentBar: "bg-indigo-500",
        };
      default:
        return {
          icon: Cpu,
          label: kind || "function",
          badgeClass: "text-sky-300 bg-sky-950/70 border-sky-800/60",
          accentBar: "bg-sky-500",
        };
    }
  })();

  const Icon = kindConfig.icon;
  const fileName = nodeData.filePath ? nodeData.filePath.split("/").pop() || nodeData.filePath : "";
  const locationText = fileName
    ? `${fileName}${nodeData.lineStart ? `:L${nodeData.lineStart}` : ""}`
    : "";

  return (
    <div
      className={`relative w-[250px] rounded-lg transition-all duration-200 select-none ${
        isDimmed ? "opacity-25" : "opacity-100"
      } ${
        isSelected
          ? "border-2 border-sky-400 bg-[#16202e] ring-4 ring-sky-400/20 shadow-xl shadow-sky-950/50"
          : isNeighbor
          ? "border-2 border-sky-500/80 bg-[#161c26] ring-2 ring-sky-500/20"
          : "border border-[#30363d] bg-[#161b22] hover:border-slate-500 hover:bg-[#1a202c]"
      }`}
    >
      {/* Top and Bottom Handles for TB Layout */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-400 !border-2 !border-[#161b22] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-sky-400 !border-2 !border-[#161b22] transition-colors"
      />

      {/* Left and Right Handles for LR Layout */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-slate-400 !border-2 !border-[#161b22] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-sky-400 !border-2 !border-[#161b22] transition-colors"
      />

      <div className="p-2.5">
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${kindConfig.badgeClass}`}
          >
            <Icon className="w-3 h-3" />
            <span>{kindConfig.label}</span>
          </span>

          {locationText && (
            <span
              className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]"
              title={nodeData.filePath}
            >
              {locationText}
            </span>
          )}
        </div>

        <div className="text-xs font-semibold font-mono text-slate-100 truncate" title={nodeData.name || nodeData.label}>
          {nodeData.name || nodeData.label}
        </div>

        {nodeData.signature && (
          <div className="text-[10px] font-mono text-slate-400 truncate mt-1 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#21262d]">
            {nodeData.signature}
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div
        className={`h-0.5 w-full rounded-b-md ${
          isSelected ? "bg-sky-400" : isNeighbor ? "bg-sky-500/70" : kindConfig.accentBar
        }`}
      />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
