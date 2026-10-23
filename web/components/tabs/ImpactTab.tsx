"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Terminal, Check } from "lucide-react";
import type { ImpactReport } from "@/lib/types";

interface ImpactTabProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  proposedChange: string;
  onProposedChangeChange: (change: string) => void;
  impactReport: ImpactReport | null;
  isAnalyzingImpact: boolean;
  onRunImpact: () => void;
}

const PRESET_CHANGES = [
  "Add distributed Redis lock retry with exponential backoff",
  "Modify idempotency key expiration window from 120s to 300s",
  "Deprecate sync payment processor in favor of async webhook worker",
];

export function ImpactTab({
  selectedSymbol,
  onSymbolChange,
  proposedChange,
  onProposedChangeChange,
  impactReport,
  isAnalyzingImpact,
  onRunImpact,
}: ImpactTabProps) {
  const [copiedTest, setCopiedTest] = useState<string | null>(null);

  const handleCopyTestCmd = (testPath: string) => {
    navigator.clipboard.writeText(`pytest ${testPath}`);
    setCopiedTest(testPath);
    setTimeout(() => setCopiedTest(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Modification Specification Form */}
      <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Evaluate Proposed Code Modification Blast Radius</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Calculates structural blast radius across downstream callers and identifies mandatory regression test suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-primary)] block mb-1">
              Target Code Symbol
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
              Proposed Change Description
            </label>
            <input
              type="text"
              value={proposedChange}
              onChange={(e) => onProposedChangeChange(e.target.value)}
              placeholder="Describe planned changes..."
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 text-xs rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-pine)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[var(--text-muted)] font-mono">Presets:</span>
          {PRESET_CHANGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onProposedChangeChange(preset)}
              className="text-xs text-[var(--brand-pine)] bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] px-2.5 py-0.5 rounded-md border border-[var(--brand-gold)] transition-colors truncate max-w-xs font-medium cursor-pointer shadow-2xs"
            >
              {preset}
            </button>
          ))}
        </div>

        <button
          onClick={() => onRunImpact()}
          disabled={isAnalyzingImpact}
          className="px-4 py-2 rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isAnalyzingImpact ? "Calculating Blast Radius..." : "Analyze Change Impact"}</span>
        </button>
      </div>

      {/* Impact Report Results */}
      {impactReport && (
        <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-2">
            <div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Advisory Report</span>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5 font-mono">
                <span>Symbol:</span>
                <span className="text-[var(--brand-pine)] bg-[var(--brand-cream)] px-2 py-0.5 rounded border border-[var(--brand-gold)]">
                  {impactReport.target_symbol}
                </span>
              </h4>
            </div>

            <div>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase flex items-center gap-1.5 ${
                  impactReport.overall_risk === "HIGH"
                    ? "bg-rose-100 text-rose-900 border border-rose-300"
                    : impactReport.overall_risk === "MEDIUM"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{impactReport.overall_risk} REGRESSION RISK</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Affected Callers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Affected Downstream Callers
                </h4>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {impactReport.affected_components.length} Callers
                </span>
              </div>

              <div className="space-y-2">
                {impactReport.affected_components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[var(--text-primary)] font-semibold truncate pr-2">
                        {comp.file_path}:L{comp.line_number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                          comp.risk_level === "HIGH"
                            ? "text-rose-900 bg-rose-100 border border-rose-300"
                            : comp.risk_level === "MEDIUM"
                            ? "text-amber-900 bg-amber-100 border border-amber-300"
                            : "text-emerald-900 bg-emerald-100 border border-emerald-300"
                        }`}
                      >
                        {comp.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {comp.recommended_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Suites */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Mandatory Verification Suites
                </h4>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {impactReport.tests_to_run.length} Suites
                </span>
              </div>

              <div className="space-y-2">
                {impactReport.tests_to_run.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-[var(--text-primary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-pine)] shrink-0" />
                      <span className="truncate">{t}</span>
                    </div>

                    <button
                      onClick={() => handleCopyTestCmd(t)}
                      title="Copy pytest command"
                      className="px-2.5 py-1 rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] text-[var(--brand-pine)] border border-[var(--brand-gold)] text-[11px] font-mono flex items-center gap-1 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    >
                      {copiedTest === t ? (
                        <>
                          <Check className="w-3 h-3 text-[var(--brand-pine)]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-3 h-3 text-[var(--brand-sage)]" />
                          <span>pytest</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
