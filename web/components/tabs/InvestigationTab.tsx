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
      <div className="col-span-12 lg:col-span-3 border border-[var(--border-default)] rounded-xl bg-[var(--bg-panel)] p-4 flex flex-col justify-between overflow-y-auto shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
              <span>Target Scope</span>
            </h3>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">AST &amp; Blame</span>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-primary)] block mb-1">
              Symbol to Investigate
            </label>
            <input
              type="text"
              value={selectedSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              placeholder="e.g. charge_with_idempotency_key"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 text-xs rounded-md font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-pine)] transition-colors placeholder:text-[var(--text-muted)] font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-primary)] block mb-1">
              Forensic Query
            </label>
            <select
              value={selectedQuestion}
              onChange={(e) => onQuestionChange(e.target.value)}
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 text-xs rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-pine)] transition-colors font-medium"
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
                className="w-full mt-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 text-xs rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-pine)]"
              />
            )}
          </div>

          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className="w-full py-2 bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isInvestigating ? "Extracting Evidence..." : "Investigate Symbol"}</span>
          </button>
        </div>

        {/* Epistemic Tiers Guide */}
        <div className="pt-4 border-t border-[var(--border-subtle)] text-xs space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Confidence Tiers
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[var(--text-primary)]">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                FACT
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans">AST syntax &amp; Git SHA</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-primary)]">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]">
                INFERENCE
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Component test suites</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-primary)]">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                HYPOTHESIS
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Heuristic rationale</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-primary)]">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                UNKNOWN
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Search unobserved</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>Verified Receipts:</span>
            <span className="text-[var(--text-primary)] font-semibold">{items.length}</span>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Answer & Forensic Synthesis */}
      <div className="col-span-12 lg:col-span-5 border border-[var(--border-default)] rounded-xl bg-[var(--bg-panel)] p-5 overflow-y-auto space-y-4 flex flex-col shadow-xs">
        {/* Status notice */}
        {investigationResult?.is_demo ? (
          <div className="px-3 py-2 bg-[var(--brand-cream)] border border-[var(--brand-gold)] rounded-lg text-xs text-[var(--brand-pine)] flex items-center gap-2 font-medium shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Curated incident simulation: Billing idempotency failure INC-8821.</span>
          </div>
        ) : (
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2 font-medium shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-pine)] shrink-0" />
            <span>Live repository forensic: AST invariants and local Git history.</span>
          </div>
        )}

        {citationNotice && (
          <div className="px-3 py-2 bg-[var(--brand-cream)] border border-[var(--brand-gold)] text-[var(--brand-pine)] text-xs rounded-lg flex items-center gap-2 shadow-xs">
            <Search className="w-3.5 h-3.5 text-[var(--brand-sage)] shrink-0" />
            <span className="font-mono text-xs">{citationNotice}</span>
          </div>
        )}

        {isInvestigating ? (
          <div className="space-y-3 py-8">
            <div className="flex items-center gap-2 text-[var(--brand-pine)] text-xs font-mono animate-pulse">
              <Cpu className="w-4 h-4" />
              <span>Traversing Git history &amp; AST definitions...</span>
            </div>
            <div className="h-4 bg-[var(--bg-subtle)] rounded animate-pulse" />
            <div className="h-20 bg-[var(--bg-subtle)] rounded animate-pulse" />
            <div className="h-12 bg-[var(--bg-subtle)] rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--brand-pine)]" />
                <span>Verified Answer &amp; Rationale</span>
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Click citations to inspect
              </span>
            </div>

            <div className="bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-xs">
              {investigationResult?.synthesis ? (
                <MarkdownRenderer
                  content={investigationResult.synthesis}
                  items={items}
                  onActivateCitation={handleActivateCitation}
                />
              ) : (
                <div className="text-center py-12 text-[var(--text-muted)] text-xs">
                  Select a symbol on the left and click &quot;Investigate Symbol&quot; to begin.
                </div>
              )}
            </div>

            {investigationResult?.recommended_next_steps &&
              investigationResult.recommended_next_steps.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2 shadow-xs">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
                    <span>Recommended Next Steps Before Refactoring</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {investigationResult.recommended_next_steps.map((step, idx) => (
                      <li key={`step-${idx}`} className="flex items-start gap-2 text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pine)] mt-1.5 shrink-0" />
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
      <div className="col-span-12 lg:col-span-4 border border-[var(--border-default)] rounded-xl bg-[var(--bg-panel)] p-4 flex flex-col overflow-hidden shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Verifiable Evidence
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">Deterministic code receipts &amp; AST facts</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--brand-cream)] border border-[var(--brand-gold)] text-[var(--brand-pine)] font-mono font-semibold">
            {items.length} Receipts
          </span>
        </div>

        {/* Pillar tab navigation */}
        <div className="grid grid-cols-4 gap-1 mt-3 p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)]">
          <button
            onClick={() => onEvidenceTabChange("git")}
            className={`py-1 rounded-md text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              evidenceTab === "git" ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs" : "hover:text-[var(--text-primary)]"
            }`}
          >
            <GitCommit className="w-3 h-3" />
            <span>Git ({pillarCounts.git})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("contract")}
            className={`py-1 rounded-md text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              evidenceTab === "contract" ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs" : "hover:text-[var(--text-primary)]"
            }`}
          >
            <FileCode className="w-3 h-3" />
            <span>AST ({pillarCounts.contract})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("test")}
            className={`py-1 rounded-md text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              evidenceTab === "test" ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs" : "hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>Tests ({pillarCounts.test})</span>
          </button>
          <button
            onClick={() => onEvidenceTabChange("blast")}
            className={`py-1 rounded-md text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              evidenceTab === "blast" ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs" : "hover:text-[var(--text-primary)]"
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
                    className={`p-3 rounded-lg border space-y-2 transition-all outline-none shadow-xs ${
                      isHighlighted
                        ? "citation-spotlight-active bg-[var(--brand-cream)] border-2 border-[var(--brand-pine)] ring-3 ring-[var(--brand-pine)]/20"
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] hover:border-[var(--brand-gold)] focus:border-[var(--brand-pine)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[var(--text-primary)] text-xs leading-snug break-words">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                          tier === "FACT"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : tier === "INFERENCE"
                            ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]"
                            : tier === "HYPOTHESIS"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-stone-100 text-stone-700 border border-stone-300"
                        }`}
                      >
                        {tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-panel)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                      <span className="truncate pr-2">{item.location}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyCitation(`[${item.id}]`, item.id)}
                          title="Copy citation tag"
                          className="hover:text-[var(--text-primary)] transition-colors p-0.5"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-[var(--brand-pine)]" />
                          ) : (
                            <Copy className="w-3 h-3 text-[var(--brand-sage)]" />
                          )}
                        </button>
                        <span className="text-[var(--brand-pine)] font-mono font-semibold">[{item.id}]</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.summary}</p>

                    {item.verifiable_payload && (
                      <pre className="p-2 bg-[var(--bg-code)] rounded border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-40 leading-snug font-medium">
                        {item.verifiable_payload}
                      </pre>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-16 text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--brand-sage)]" />
              <span>No evidence receipts found under this pillar.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
