"use client";

import React, { useState, useMemo } from "react";
import { FolderGit2, RefreshCw, Search, Code2, Box, GitFork, ArrowRight } from "lucide-react";
import type { SymbolItem } from "@/lib/types";

interface ExplorerTabProps {
  symbols: SymbolItem[];
  onSelectSymbol: (symbolName: string) => void;
  onRefreshSymbols: () => void;
}

export function ExplorerTab({
  symbols,
  onSelectSymbol,
  onRefreshSymbols,
}: ExplorerTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");

  const filteredSymbols = useMemo(() => {
    return symbols.filter((sym) => {
      const matchesSearch =
        sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sym.file_path && sym.file_path.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesKind =
        selectedKind === "all" || sym.kind.toLowerCase() === selectedKind.toLowerCase();

      return matchesSearch && matchesKind;
    });
  }, [symbols, searchQuery, selectedKind]);

  const getKindIcon = (kind: string) => {
    const k = kind.toLowerCase();
    if (k.includes("class")) return <Box className="w-3.5 h-3.5 text-[var(--brand-gold)]" />;
    if (k.includes("method")) return <GitFork className="w-3.5 h-3.5 text-[var(--brand-sage)]" />;
    return <Code2 className="w-3.5 h-3.5 text-[var(--brand-pine)]" />;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Explorer Header */}
      <div className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[var(--brand-pine)]" />
            <span>Repository AST Symbol Catalog</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Deterministic AST extraction of functions, classes, and methods across target repository files.
          </p>
        </div>

        <button
          onClick={onRefreshSymbols}
          className="px-3 py-1.5 text-xs rounded-md bg-[var(--brand-cream)] hover:bg-[var(--brand-gold)] text-[var(--brand-pine)] font-medium border border-[var(--brand-gold)] flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
          <span>Refresh Symbols</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-default)] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[var(--brand-sage)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbols or files..."
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] pl-9 pr-3 py-1.5 text-xs rounded-md text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-pine)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["all", "function", "class", "method"].map((k) => (
            <button
              key={k}
              onClick={() => setSelectedKind(k)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors font-medium ${
                selectedKind === k
                  ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border border-[var(--brand-gold)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {k === "all" ? "All Kinds" : `${k}s`}
            </button>
          ))}
          <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
            ({filteredSymbols.length} of {symbols.length})
          </span>
        </div>
      </div>

      {/* Structured Developer Table/List View */}
      <div className="rounded-xl bg-[var(--bg-panel)] border border-[var(--border-default)] overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-4">Symbol Name</div>
          <div className="col-span-2 sm:col-span-2">Kind</div>
          <div className="col-span-5 sm:col-span-5">Declared Location</div>
          <div className="hidden sm:block sm:col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)] max-h-[600px] overflow-y-auto">
          {filteredSymbols.length > 0 ? (
            filteredSymbols.map((sym, i) => (
              <div
                key={`${sym.name}-${i}`}
                onClick={() => onSelectSymbol(sym.name)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group text-xs font-mono"
              >
                <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate pr-2">
                  {getKindIcon(sym.kind)}
                  <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-pine)] transition-colors truncate">
                    {sym.name}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--brand-cream)] border border-[var(--brand-gold)] text-[var(--brand-pine)] font-semibold uppercase font-sans">
                    {sym.kind}
                  </span>
                </div>

                <div className="col-span-5 sm:col-span-5 text-[var(--text-muted)] truncate pr-2">
                  {sym.file_path ? `${sym.file_path}:L${sym.line}` : "Demo Target"}
                </div>

                <div className="hidden sm:flex sm:col-span-1 justify-end text-[var(--brand-sage)] group-hover:text-[var(--brand-pine)] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-[var(--text-muted)] text-xs">
              No symbols match your search. Use &quot;Scan AST Symbols&quot; in the header to re-index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
