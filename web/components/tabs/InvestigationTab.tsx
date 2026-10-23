"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Play,
  CheckCircle2,
  Cpu,
  Search,
  AlertCircle,
  GitCommit,
  FileCode,
  CheckSquare,
  Share2,
  Copy,
  Check,
  ListChecks,
} from "lucide-react";
import type {
  InvestigationResult,
  EvidenceTabId,
} from "@/lib/types";
import {
  MarkdownRenderer,
  getEpistemicTier,
  findMatchingEvidence,
} from "@/components/common/MarkdownRenderer";

interface InvestigationTabProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  selectedQuestion: string;
  onQuestionChange: (question: string) => void;
  customQuestion: string;
  onCustomQuestionChange: (question: string) => void;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
  investigationResult: InvestigationResult | null;
  evidenceTab: EvidenceTabId;
  onEvidenceTabChange: (tab: EvidenceTabId) => void;
}

export function determinePillarTab(pillar: string): EvidenceTabId {
  const p = pillar.toLowerCase();
  if (p.includes("temporal") || p.includes("git")) return "git";
  if (p.includes("contract") || p.includes("invariant") || p.includes("ast")) return "contract";
  if (p.includes("verification") || p.includes("test")) return "test";
  if (p.includes("blast") || p.includes("structural") || p.includes("dependency")) return "blast";
  return "git";
}

export function InvestigationTab({
  selectedSymbol,
  onSymbolChange,
  selectedQuestion,
  onQuestionChange,
  customQuestion,
  onCustomQuestionChange,
  isInvestigating,
  onRunInvestigation,
  investigationResult,
  evidenceTab,
  onEvidenceTabChange,
}: InvestigationTabProps) {
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [citationNotice, setCitationNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const items = useMemo(() => investigationResult?.items || [], [investigationResult]);

  const pillarCounts = useMemo(() => {
    const counts = { git: 0, contract: 0, test: 0, blast: 0 };
    items.forEach((it) => {
      const p = determinePillarTab(it.pillar);
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [items]);

  const handleCopyCitation = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleActivateCitation = useCallback(
    (citationText: string) => {
      const match = findMatchingEvidence(citationText, items);
      if (!match) {
        setCitationNotice(`Unmatched reference "${citationText}" — no exact receipt found.`);
        setTimeout(() => setCitationNotice(null), 3500);
        return;
      }

      const targetTab = determinePillarTab(match.pillar);
      if (evidenceTab !== targetTab) {
        onEvidenceTabChange(targetTab);
      }

      setHighlightedCardId(match.id);
      setCitationNotice(`Scrolled to receipt [${match.id}] in ${match.pillar}`);
      setTimeout(() => setCitationNotice(null), 3000);

      setTimeout(() => {
        const cardElem = document.getElementById(`evidence-card-${match.id}`);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: "smooth", block: "center" });
          cardElem.focus();
        }
      }, 120);

      setTimeout(() => {
        setHighlightedCardId((prev) => (prev === match.id ? null : prev));
      }, 3000);
    },
    [items, evidenceTab, onEvidenceTabChange]
  );

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)]">
      {/* LEFT PANEL: Scope Selector */}
      <div className="col-span-12 lg:col-span-3 border border-[#21262d] rounded-md bg-[#161b22] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>Target Scope</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">AST &amp; Blame</span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Symbol to Investigate
            </label>
            <input
              type="text"
              value={selectedSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              placeholder="e.g. charge_with_idempotency_key"
              className="w-full bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs rounded font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Forensic Query
            </label>
            <select
              value={selectedQuestion}
              onChange={(e) => onQuestionChange(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs rounded text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option>Why was this function introduced?</option>
              <option>Which files depend on this module?</option>
              <option>Which commits changed this behavior?</option>
              <option>What tests should I inspect before changing this code?</option>
              <option>Custom...</option>
            </select>
            {selectedQuestion === "Custom..." && (
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => onCustomQuestionChange(e.target.value)}
                placeholder="Enter specific question..."
                className="w-full mt-2 bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            )}
          </div>

          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isInvestigating ? "Extracting Evidence..." : "Investigate Symbol"}</span>
          </button>
        </div>

        {/* Epistemic Tiers Guide (Technical, concise) */}
        <div className="pt-4 border-t border-[#21262d] text-xs space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Confidence Tiers
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                FACT
              </span>
              <span className="text-[11px] text-slate-400 font-sans">AST syntax &amp; Git SHA</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                INFERENCE
              </span>
              <span className="text-[11px] text-slate-400 font-sans">Component test suites</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                HYPOTHESIS
              </span>
              <span className="text-[11px] text-slate-400 font-sans">Heuristic rationale</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                UNKNOWN
              </span>
              <span className="text-[11px] text-slate-400 font-sans">Search unobserved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] flex justify-between text-xs text-slate-400 font-mono">
            <span>Verified Receipts:</span>
            <span className="text-slate-200 font-semibold">{items.length}</span>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Answer & Forensic Synthesis */}
      <div className="col-span-12 lg:col-span-5 border border-[#21262d] rounded-md bg-[#161b22] p-5 overflow-y-auto space-y-4 flex flex-col">
        {/* Status notice */}
        {investigationResult?.is_demo ? (
          <div className="px-3 py-2 bg-amber-950/40 border border-amber-800/70 rounded text-xs text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Curated incident simulation: Billing idempotency failure INC-8821.</span>
          </div>
        ) : (
          <div className="px-3 py-2 bg-emerald-950/40 border border-emerald-800/70 rounded text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Live repository forensic: AST invariants and local Git history.</span>
          </div>
        )}

        {citationNotice && (
          <div className="px-3 py-2 bg-sky-950/70 border border-sky-800 text-sky-200 text-xs rounded flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-mono text-xs">{citationNotice}</span>
          </div>
        )}

        {isInvestigating ? (
          <div className="space-y-3 py-8">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono animate-pulse">
              <Cpu className="w-4 h-4" />
              <span>Traversing Git history &amp; AST definitions...</span>
            </div>
            <div className="h-4 bg-[#0d1117] rounded animate-pulse" />
            <div className="h-20 bg-[#0d1117] rounded animate-pulse" />
            <div className="h-12 bg-[#0d1117] rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Verified Answer &amp; Rationale</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Click citations to inspect
              </span>
            </div>

            <div className="bg-[#0d1117] p-4 rounded border border-[#21262d]">
              {investigationResult?.synthesis ? (
                <MarkdownRenderer
                  content={investigationResult.synthesis}
                  items={items}
                  onActivateCitation={handleActivateCitation}
                />
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select a symbol on the left and click &quot;Investigate Symbol&quot; to begin.
                </div>
              )}
            </div>

            {investigationResult?.recommended_next_steps &&
              investigationResult.recommended_next_steps.length > 0 && (
                <div className="p-4 rounded bg-[#0d1117] border border-[#21262d] space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recommended Next Steps Before Refactoring</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {investigationResult.recommended_next_steps.map((step, idx) => (
                      <li key={`step-${idx}`} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <MarkdownRenderer
                            content={step}
                            items={items}
                            onActivateCitation={handleActivateCitation}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Evidence Receipts Stream */}
      <div className="col-span-12 lg:col-span-4 border border-[#21262d] rounded-md bg-[#161b22] p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Verifiable Evidence
            </h3>
            <p className="text-[11px] text-slate-400">Deterministic code receipts &amp; AST facts</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-slate-300 font-mono">
            {items.length} Receipts
          </span>
        </div>

        {/* Pillar tab navigation */}
        <div className="grid grid-cols-4 gap-1 mt-3 p-0.5 bg-[#0d1117] rounded border border-[#21262d] text-xs font-medium text-slate-400">
          <button
            onClick={() => onEvidenceTabChange("git")}
            className={`py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
              evidenceTab === "git" ? "bg-[#21262d] text-slate-100 font-semibold" : "hover:text-slate-200"
            }`}
          >
            <GitCommit className="w-3 h-3" />
            <span>Git ({pillarCounts.git})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("contract")}
            className={`py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
              evidenceTab === "contract" ? "bg-[#21262d] text-slate-100 font-semibold" : "hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3 h-3" />
            <span>AST ({pillarCounts.contract})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("test")}
            className={`py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
              evidenceTab === "test" ? "bg-[#21262d] text-slate-100 font-semibold" : "hover:text-slate-200"
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>Tests ({pillarCounts.test})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("blast")}
            className={`py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
              evidenceTab === "blast" ? "bg-[#21262d] text-slate-100 font-semibold" : "hover:text-slate-200"
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Blast ({pillarCounts.blast})</span>
          </button>
        </div>

        {/* Evidence items list */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
          {items.length > 0 ? (
            items
              .filter((it) => {
                if (evidenceTab === "git") return it.pillar.includes("Temporal") || it.pillar.includes("Git");
                if (evidenceTab === "contract") return it.pillar.includes("Contract") || it.pillar.includes("Invariant") || it.pillar.includes("AST");
                if (evidenceTab === "test") return it.pillar.includes("Verification") || it.pillar.includes("Test");
                if (evidenceTab === "blast") return it.pillar.includes("Blast") || it.pillar.includes("Structural") || it.pillar.includes("Dependency");
                return true;
              })
              .map((item) => {
                const isHighlighted = highlightedCardId === item.id;
                const tier = getEpistemicTier(item);

                return (
                  <div
                    key={item.id}
                    id={`evidence-card-${item.id}`}
                    tabIndex={0}
                    className={`p-3 rounded border space-y-2 transition-all outline-none ${
                      isHighlighted
                        ? "citation-spotlight-active bg-[#0d1117] border-sky-400"
                        : "bg-[#0d1117] border-[#21262d] hover:border-[#30363d] focus:border-sky-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-100 text-xs leading-snug break-words">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                          tier === "FACT"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : tier === "INFERENCE"
                            ? "bg-sky-950 text-sky-400 border border-sky-800"
                            : tier === "HYPOTHESIS"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}
                      >
                        {tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-[#161b22] px-2 py-1 rounded border border-[#21262d]">
                      <span className="truncate pr-2">{item.location}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyCitation(`[${item.id}]`, item.id)}
                          title="Copy citation tag"
                          className="hover:text-slate-200 transition-colors p-0.5"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                        <span className="text-slate-300 font-mono">[{item.id}]</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

                    {item.verifiable_payload && (
                      <pre className="p-2 bg-[#07090d] rounded border border-[#21262d] font-mono text-[11px] text-sky-200 overflow-x-auto whitespace-pre-wrap max-h-40 leading-snug">
                        {item.verifiable_payload}
                      </pre>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-16 text-xs text-slate-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-600" />
              <span>No evidence receipts found under this pillar.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
