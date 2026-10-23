"use client";

import React, { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { EvidenceItem } from "@/lib/types";

interface MarkdownRendererProps {
  content: string;
  items: EvidenceItem[];
  onActivateCitation?: (citation: string) => void;
  className?: string;
}

export type EpistemicTier = "FACT" | "INFERENCE" | "HYPOTHESIS" | "UNKNOWN";

export function getEpistemicTier(item: EvidenceItem): EpistemicTier {
  const label = (item.confidence_label || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const summary = (item.summary || "").toLowerCase();

  if (
    label.includes("unknown") ||
    title.includes("unknown") ||
    summary.includes("not found") ||
    summary.includes("zero automated")
  ) {
    return "UNKNOWN";
  }
  if (
    label.includes("hypothesis") ||
    label.includes("speculative") ||
    label.includes("heuristic")
  ) {
    return "HYPOTHESIS";
  }
  if (
    label.includes("indirect") ||
    label.includes("inference") ||
    label.includes("evolution") ||
    label.includes("component test suite")
  ) {
    return "INFERENCE";
  }
  if (
    item.is_verified ||
    label.includes("direct") ||
    label.includes("ast") ||
    label.includes("blame") ||
    label.includes("verified")
  ) {
    return "FACT";
  }
  return "INFERENCE";
}

export function findMatchingEvidence(
  rawRef: string,
  items: EvidenceItem[]
): EvidenceItem | null {
  if (!items || items.length === 0) return null;

  const cleaned = rawRef.replace(/^[`[]+|[`\]]+$/g, "").trim();
  if (!cleaned) return null;

  const target = cleaned.toLowerCase();

  // 1. Exact ID match (case-insensitive)
  const exactId = items.find((it) => it.id.toLowerCase() === target);
  if (exactId) return exactId;

  // 2. Commit hash match (6-40 hex chars)
  const isHexHash = /^[0-9a-f]{6,40}$/i.test(cleaned);
  if (isHexHash) {
    const hashMatch = items.find(
      (it) =>
        it.verifiable_payload.toLowerCase().includes(target) ||
        it.title.toLowerCase().includes(target) ||
        it.location.toLowerCase().includes(target)
    );
    if (hashMatch) return hashMatch;
  }

  // 3. Incident or reference ID in title or location (e.g. INC-8821)
  const refMatch = items.find(
    (it) =>
      it.id.toLowerCase().includes(target) ||
      it.title.toLowerCase().includes(target) ||
      it.location.toLowerCase().includes(target)
  );
  if (refMatch) return refMatch;

  return null;
}

export function MarkdownRenderer({
  content,
  items,
  onActivateCitation,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  const renderInline = (lineText: string, keyPrefix: string): ReactNode[] => {
    // Matches: **bold**, `code`, [citation], INC-1234, or hex hashes
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]|\bINC-\d+\b|\b[0-9a-f]{7,40}\b)/g;
    const segments = lineText.split(tokenRegex);

    return segments.map((seg, idx) => {
      const segKey = `${keyPrefix}-seg-${idx}`;
      if (!seg) return null;

      // Bold match
      if (seg.startsWith("**") && seg.endsWith("**") && seg.length >= 4) {
        const inner = seg.slice(2, -2);
        const match = findMatchingEvidence(inner, items);
        if (match && onActivateCitation) {
          return renderCitationButton(inner, match, segKey);
        }
        return (
          <strong key={segKey} className="font-semibold text-slate-100">
            {inner}
          </strong>
        );
      }

      // Inline code or bracketed citation or incident code or commit hash
      const cleanTarget = seg.replace(/^[`[]+|[`\]]+$/g, "").trim();
      const match = findMatchingEvidence(cleanTarget, items);

      if (match && onActivateCitation) {
        return renderCitationButton(seg, match, segKey);
      }

      // Code span
      if (seg.startsWith("`") && seg.endsWith("`") && seg.length >= 2) {
        return (
          <code
            key={segKey}
            className="font-mono text-xs text-sky-300 bg-[#161b22] border border-[#30363d] px-1 py-0.5 rounded"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Unmatched bracketed token
      if (seg.startsWith("[") && seg.endsWith("]")) {
        return (
          <span
            key={segKey}
            className="font-mono text-xs text-slate-400 bg-[#161b22] px-1 py-0.5 rounded border border-[#21262d]"
          >
            {seg}
          </span>
        );
      }

      return <span key={segKey}>{seg}</span>;
    });
  };

  const renderCitationButton = (displayText: string, match: EvidenceItem, key: string) => {
    const tier = getEpistemicTier(match);

    return (
      <button
        key={key}
        type="button"
        onClick={() => {
          if (onActivateCitation) {
            onActivateCitation(displayText);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onActivateCitation) {
              onActivateCitation(displayText);
            }
          }
        }}
        title={`Evidence Receipt [${match.id}] • Tier: ${tier} • Click to jump`}
        aria-label={`Jump to evidence receipt ${match.id}`}
        className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-sky-400 text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-colors cursor-pointer align-baseline"
      >
        <span>{displayText}</span>
        <span
          className={`text-[9px] px-1 rounded font-sans font-semibold uppercase ${
            tier === "FACT"
              ? "text-emerald-400 bg-emerald-950/60"
              : tier === "INFERENCE"
              ? "text-sky-300 bg-sky-950/60"
              : tier === "HYPOTHESIS"
              ? "text-amber-300 bg-amber-950/60"
              : "text-slate-400 bg-slate-900"
          }`}
        >
          {tier}
        </span>
        <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-70 shrink-0" />
      </button>
    );
  };

  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = (listIndex: number) => {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul key={`list-${listIndex}`} className="space-y-1.5 my-2 pl-2">
          {listBuffer.map((itemText, idx) => (
            <li key={`li-${listIndex}-${idx}`} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
              <div className="flex-1">{renderInline(itemText, `li-${listIndex}-${idx}`)}</div>
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={`code-${lineIdx}`}
            className="my-3 p-3 bg-[#0b0e14] rounded border border-[#30363d] font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-snug"
          >
            {codeBuffer.join("\n")}
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList(lineIdx);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
      return;
    }

    flushList(lineIdx);

    if (!trimmed) {
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4
          key={`h4-${lineIdx}`}
          className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-4 mb-1.5 border-b border-[#21262d] pb-1"
        >
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const headingText = trimmed.replace(/^#+\s*/, "");
      blocks.push(
        <h3
          key={`h3-${lineIdx}`}
          className="text-sm font-semibold text-slate-100 mt-4 mb-2 tracking-tight"
        >
          {headingText}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("**") && trimmed.endsWith(":") && trimmed.length > 4) {
      blocks.push(
        <h5
          key={`title-${lineIdx}`}
          className="text-xs font-semibold text-slate-200 mt-3 mb-1"
        >
          {trimmed.slice(2, -1).replace(/\*\*/g, "")}:
        </h5>
      );
      return;
    }

    blocks.push(
      <p key={`p-${lineIdx}`} className="text-xs leading-relaxed text-slate-300 my-1.5">
        {renderInline(trimmed, `p-${lineIdx}`)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}
