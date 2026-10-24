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
    <header className="h-14 border-b border-[var(--border-default)] bg-[var(--bg-panel)]/95 backdrop-blur px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      {/* Left side: Repository Scope Switcher & Local Path Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-0.5 text-xs">
          <button
            onClick={() => onRepoModeChange("demo")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              repoMode === "demo"
                ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Sparkles className="w-3 h-3 text-[var(--brand-pine)]" />
            <span>Curated Demo Repo</span>
          </button>
          <button
            onClick={() => onRepoModeChange("local")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              repoMode === "local"
                ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FolderGit2 className="w-3 h-3 text-[var(--brand-pine)]" />
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
              className="w-72 bg-[var(--bg-panel)] border border-[var(--border-default)] px-3 py-1 text-xs rounded-md text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-pine)] transition-colors placeholder:text-[var(--text-muted)]"
            />
            <button
              onClick={onValidatePath}
              disabled={isValidating}
              className="px-2.5 py-1 text-xs rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] disabled:opacity-50 text-[var(--brand-pine)] font-medium border border-[var(--brand-gold)] flex items-center gap-1 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isValidating ? "animate-spin text-[var(--brand-pine)]" : "text-[var(--brand-sage)]"}`} />
              <span>Validate</span>
            </button>
            {validation?.is_valid && (
              <button
                onClick={onIndexRepo}
                disabled={isIndexing}
                className="px-2.5 py-1 text-xs rounded-md bg-[var(--brand-sage)] hover:bg-[var(--brand-pine)] disabled:opacity-50 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
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
          <span className="text-xs font-mono text-[var(--brand-pine)] bg-[var(--brand-cream)] border border-[var(--brand-gold)] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sage)]" />
            aegis-commerce-core (INC-8821)
          </span>
        ) : validation?.is_valid ? (
          <span className="text-xs font-mono text-[var(--brand-pine)] bg-[var(--brand-cream)] border border-[var(--brand-gold)] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-[var(--brand-pine)]" />
            <span>{validation.git_branch || "main"}</span>
            <span className="text-[var(--text-muted)]">({validation.scanned_files_count} files)</span>
          </span>
        ) : null}

        <button
          onClick={() => onRunInvestigation()}
          disabled={isInvestigating}
          className="px-4 py-1.5 rounded-md bg-[var(--brand-pine)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>{isInvestigating ? "Investigating..." : "Investigate Memory"}</span>
        </button>
      </div>
    </header>
  );
}
