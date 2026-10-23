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
    if (k.includes("class")) return <Box className="w-3.5 h-3.5 text-violet-400" />;
    if (k.includes("method")) return <GitFork className="w-3.5 h-3.5 text-sky-400" />;
    return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Explorer Header */}
      <div className="p-4 rounded-md bg-[#161b22] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            <span>Repository AST Symbol Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic AST extraction of functions, classes, and methods across target repository files.
          </p>
        </div>

        <button
          onClick={onRefreshSymbols}
          className="px-3 py-1.5 text-xs rounded bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-medium border border-[#30363d] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Symbols</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#161b22] rounded-md border border-[#21262d]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbols or files..."
            className="w-full bg-[#0d1117] border border-[#30363d] pl-9 pr-3 py-1.5 text-xs rounded text-slate-200 font-mono focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["all", "function", "class", "method"].map((k) => (
            <button
              key={k}
              onClick={() => setSelectedKind(k)}
              className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                selectedKind === k
                  ? "bg-[#21262d] text-slate-100 font-semibold border border-[#30363d]"
                  : "text-slate-400 hover:text-slate-200 bg-transparent"
              }`}
            >
              {k === "all" ? "All Kinds" : `${k}s`}
            </button>
          ))}
          <span className="text-xs font-mono text-slate-500 ml-2">
            ({filteredSymbols.length} of {symbols.length})
          </span>
        </div>
      </div>

      {/* Structured Developer Table/List View (Anti-Slop: NOT a grid of 50 identical boxed cards) */}
      <div className="rounded-md bg-[#161b22] border border-[#21262d] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-[#0d1117] border-b border-[#21262d] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-4">Symbol Name</div>
          <div className="col-span-2 sm:col-span-2">Kind</div>
          <div className="col-span-5 sm:col-span-5">Declared Location</div>
          <div className="hidden sm:block sm:col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-[#21262d] max-h-[600px] overflow-y-auto">
          {filteredSymbols.length > 0 ? (
            filteredSymbols.map((sym, i) => (
              <div
                key={`${sym.name}-${i}`}
                onClick={() => onSelectSymbol(sym.name)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-[#1c2128] cursor-pointer transition-colors group text-xs font-mono"
              >
                <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate pr-2">
                  {getKindIcon(sym.kind)}
                  <span className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                    {sym.name}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0d1117] border border-[#30363d] text-slate-400 uppercase font-sans">
                    {sym.kind}
                  </span>
                </div>

                <div className="col-span-5 sm:col-span-5 text-slate-400 truncate pr-2">
                  {sym.file_path ? `${sym.file_path}:L${sym.line}` : "Demo Target"}
                </div>

                <div className="hidden sm:flex sm:col-span-1 justify-end text-slate-500 group-hover:text-sky-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              No symbols match your search. Use &quot;Scan AST Symbols&quot; in the header to re-index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
