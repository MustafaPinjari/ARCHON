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
      <div className="p-5 rounded-md bg-[#161b22] border border-[#21262d] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Evaluate Proposed Code Modification Blast Radius</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Calculates structural blast radius across downstream callers and identifies mandatory regression test suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Target Code Symbol
            </label>
            <input
              type="text"
              value={selectedSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              placeholder="e.g. charge_with_idempotency_key"
              className="w-full bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs rounded font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Proposed Change Description
            </label>
            <input
              type="text"
              value={proposedChange}
              onChange={(e) => onProposedChangeChange(e.target.value)}
              placeholder="Describe planned changes..."
              className="w-full bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs rounded text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-mono">Presets:</span>
          {PRESET_CHANGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onProposedChangeChange(preset)}
              className="text-xs text-slate-400 bg-[#0d1117] hover:text-slate-200 hover:bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] transition-colors truncate max-w-xs"
            >
              {preset}
            </button>
          ))}
        </div>

        <button
          onClick={onRunImpact}
          disabled={isAnalyzingImpact}
          className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isAnalyzingImpact ? "Calculating Blast Radius..." : "Analyze Change Impact"}</span>
        </button>
      </div>

      {/* Impact Report Results */}
      {impactReport && (
        <div className="p-5 rounded-md bg-[#161b22] border border-[#21262d] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#21262d] gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Advisory Report</span>
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5 font-mono">
                <span>Symbol:</span>
                <span className="text-sky-300 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
                  {impactReport.target_symbol}
                </span>
              </h4>
            </div>

            <div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase flex items-center gap-1.5 ${
                  impactReport.overall_risk === "HIGH"
                    ? "bg-rose-950 text-rose-400 border border-rose-800"
                    : impactReport.overall_risk === "MEDIUM"
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : "bg-emerald-950 text-emerald-400 border border-emerald-800"
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
              <div className="flex items-center justify-between pb-1 border-b border-[#21262d]">
                <h4 className="text-xs font-semibold text-slate-300">
                  Affected Downstream Callers
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {impactReport.affected_components.length} Callers
                </span>
              </div>

              <div className="space-y-2">
                {impactReport.affected_components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0d1117] rounded border border-[#21262d] space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-200 font-semibold truncate pr-2">
                        {comp.file_path}:L{comp.line_number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                          comp.risk_level === "HIGH"
                            ? "text-rose-400 bg-rose-950/60"
                            : comp.risk_level === "MEDIUM"
                            ? "text-amber-400 bg-amber-950/60"
                            : "text-emerald-400 bg-emerald-950/60"
                        }`}
                      >
                        {comp.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {comp.recommended_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Suites */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#21262d]">
                <h4 className="text-xs font-semibold text-slate-300">
                  Mandatory Verification Suites
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {impactReport.tests_to_run.length} Suites
                </span>
              </div>

              <div className="space-y-2">
                {impactReport.tests_to_run.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#0d1117] rounded border border-[#21262d] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{t}</span>
                    </div>

                    <button
                      onClick={() => handleCopyTestCmd(t)}
                      title="Copy pytest command"
                      className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] text-[11px] font-mono flex items-center gap-1 transition-colors shrink-0"
                    >
                      {copiedTest === t ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-3 h-3 text-slate-400" />
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
