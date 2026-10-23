"use client";

import React from "react";
import { CheckCircle2, Database, Play, RefreshCw, FolderGit2, Sparkles } from "lucide-react";
import type { ValidationResponse, RepoMode } from "@/lib/types";

interface HeaderProps {
  repoMode: RepoMode;
  onRepoModeChange: (mode: RepoMode) => void;
  localPath: string;
  onLocalPathChange: (path: string) => void;
  validation: ValidationResponse | null;
  isValidating: boolean;
  onValidatePath: () => void;
  isIndexing: boolean;
  onIndexRepo: () => void;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
}

export function Header({
  repoMode,
  onRepoModeChange,
  localPath,
  onLocalPathChange,
  validation,
  isValidating,
  onValidatePath,
  isIndexing,
  onIndexRepo,
  isInvestigating,
  onRunInvestigation,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#21262d] bg-[#0d1117]/95 backdrop-blur px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left side: Repository Scope Switcher & Local Path Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded p-0.5 text-xs">
          <button
            onClick={() => onRepoModeChange("demo")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              repoMode === "demo"
                ? "bg-[#21262d] text-slate-100 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Curated Demo Repo</span>
          </button>
          <button
            onClick={() => onRepoModeChange("local")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              repoMode === "local"
                ? "bg-[#21262d] text-slate-100 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderGit2 className="w-3 h-3 text-sky-400" />
            <span>Local Git Workspace</span>
          </button>
        </div>

        {repoMode === "local" && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={localPath}
              onChange={(e) => onLocalPathChange(e.target.value)}
              placeholder="e.g. C:\Users\user\Projects\my-repo"
              className="w-72 bg-[#161b22] border border-[#30363d] px-3 py-1 text-xs rounded text-slate-100 font-mono focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
            />
            <button
              onClick={onValidatePath}
              disabled={isValidating}
              className="px-2.5 py-1 text-xs rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-slate-200 font-medium border border-[#30363d] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isValidating ? "animate-spin text-sky-400" : "text-slate-400"}`} />
              <span>Validate</span>
            </button>
            {validation?.is_valid && (
              <button
                onClick={onIndexRepo}
                disabled={isIndexing}
                className="px-2.5 py-1 text-xs rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Database className="w-3 h-3" />
                <span>{isIndexing ? "Indexing..." : "Index Neo4j"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right side: Repo Status Badge & Primary Action CTA */}
      <div className="flex items-center gap-3">
        {repoMode === "demo" ? (
          <span className="text-xs font-mono text-slate-300 bg-[#161b22] border border-[#30363d] px-2.5 py-1 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            aegis-commerce-core (INC-8821)
          </span>
        ) : validation?.is_valid ? (
          <span className="text-xs font-mono text-slate-300 bg-[#161b22] border border-[#30363d] px-2.5 py-1 rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{validation.git_branch || "main"}</span>
            <span className="text-slate-500">({validation.scanned_files_count} files)</span>
          </span>
        ) : null}

        <button
          onClick={onRunInvestigation}
          disabled={isInvestigating}
          className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>{isInvestigating ? "Investigating..." : "Investigate Memory"}</span>
        </button>
      </div>
    </header>
  );
}
