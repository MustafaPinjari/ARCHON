"use client";

import React from "react";
import Image from "next/image";
import { Cpu, Database, Shield } from "lucide-react";
import type { HealthStatus, TabId, NavItem } from "@/lib/types";

interface SidebarProps {
  navItems: NavItem[];
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  health: HealthStatus | null;
}

export function Sidebar({
  navItems,
  activeTab,
  onSelectTab,
  health,
}: SidebarProps) {
  return (
    <aside className="w-60 border-r border-[#21262d] bg-[#0d1117] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand identity header */}
        <div className="p-4 border-b border-[#21262d]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden border border-[#30363d] bg-black flex items-center justify-center p-0.5">
              <Image
                src="/icon.png"
                alt="ARCHON Emblem"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
                  ARCHON
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-[#161b22] text-slate-300 border border-[#30363d]">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Engineering Memory Engine
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-[#21262d] font-mono">
            <span>hackFront 2026</span>
            <span className="inline-flex items-center gap-1.5 text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Neo4j Track
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#161b22] text-slate-100 font-semibold border-l-2 border-sky-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#161b22]/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-sky-400" : "text-slate-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Telemetry & Safety Status */}
      <div className="p-3 border-t border-[#21262d] bg-[#0d1117] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>REST API:</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            :8000
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Neo4j:</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
              health?.neo4j?.is_connected ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health?.neo4j?.is_connected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {health?.neo4j?.is_connected ? "CONNECTED" : "FALLBACK"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 pt-1.5 border-t border-[#21262d]">
          <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] text-slate-300 font-medium block truncate">
              Zero-Execution Active
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              Static AST Air-Gap
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
