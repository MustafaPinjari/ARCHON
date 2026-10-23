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
          badgeClass: "text-[var(--brand-pine)] bg-[var(--brand-cream)] border-[var(--brand-gold)]",
          accentBar: "bg-[var(--brand-gold)]",
        };
      case "test":
        return {
          icon: ShieldCheck,
          label: "test",
          badgeClass: "text-amber-900 bg-amber-100 border-amber-300",
          accentBar: "bg-amber-500",
        };
      case "file":
        return {
          icon: FileCode,
          label: "file",
          badgeClass: "text-[var(--brand-pine)] bg-emerald-100 border-emerald-300",
          accentBar: "bg-[var(--brand-sage)]",
        };
      case "method":
        return {
          icon: Code2,
          label: "method",
          badgeClass: "text-[var(--brand-pine)] bg-[var(--brand-cream)] border-[var(--brand-gold)]",
          accentBar: "bg-[var(--brand-sage)]",
        };
      default:
        return {
          icon: Cpu,
          label: kind || "function",
          badgeClass: "text-[var(--brand-pine)] bg-[var(--brand-cream)] border-[var(--brand-gold)]",
          accentBar: "bg-[var(--brand-pine)]",
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
      className={`relative w-[250px] rounded-lg transition-all duration-200 select-none shadow-xs ${
        isDimmed ? "opacity-25" : "opacity-100"
      } ${
        isSelected
          ? "border-2 border-[var(--brand-pine)] bg-[var(--brand-cream)] ring-3 ring-[var(--brand-pine)]/20 shadow-md"
          : isNeighbor
          ? "border-2 border-[var(--brand-sage)] bg-[var(--bg-subtle)] ring-2 ring-[var(--brand-sage)]/25"
          : "border border-[var(--border-default)] bg-[var(--bg-panel)] hover:border-[var(--brand-sage)] hover:bg-[var(--bg-hover)]"
      }`}
    >
      {/* Top and Bottom Handles for TB Layout */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[var(--brand-sage)] !border-2 !border-white transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[var(--brand-pine)] !border-2 !border-white transition-colors"
      />

      {/* Left and Right Handles for LR Layout */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-[var(--brand-sage)] !border-2 !border-white transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-[var(--brand-pine)] !border-2 !border-white transition-colors"
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
              className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[130px]"
              title={nodeData.filePath}
            >
              {locationText}
            </span>
          )}
        </div>

        <div className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate" title={nodeData.name || nodeData.label}>
          {nodeData.name || nodeData.label}
        </div>

        {nodeData.signature && (
          <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate mt-1 bg-[var(--bg-code)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
            {nodeData.signature}
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div
        className={`h-1 w-full rounded-b-md ${
          isSelected ? "bg-[var(--brand-pine)]" : isNeighbor ? "bg-[var(--brand-sage)]" : kindConfig.accentBar
        }`}
      />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
