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
    <aside className="w-60 border-r border-[var(--border-default)] bg-[var(--bg-panel)] flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Brand identity header */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden border border-[var(--border-default)] bg-[var(--brand-cream)] flex items-center justify-center p-0.5 shadow-xs">
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
                <span className="font-mono text-sm font-bold tracking-wider text-[var(--text-primary)]">
                  ARCHON
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-[var(--brand-cream)] text-[var(--brand-pine)] border border-[var(--brand-gold)]">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                Engineering Memory Engine
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)] font-mono">
            <span>hackFront 2026</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--brand-pine)] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sage)] animate-pulse" />
              Neo4j Track
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--brand-cream)] text-[var(--brand-pine)] font-semibold border-l-3 border-[var(--brand-pine)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-[var(--brand-pine)]" : "text-[var(--brand-sage)]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Telemetry & Safety Status */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            <Cpu className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
            <span>REST API:</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--brand-pine)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sage)]" />
            :8000
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            <Database className="w-3.5 h-3.5 text-[var(--brand-sage)]" />
            <span>Neo4j:</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
              health?.neo4j?.is_connected ? "text-[var(--brand-pine)]" : "text-amber-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health?.neo4j?.is_connected ? "bg-[var(--brand-pine)]" : "bg-amber-600"
              }`}
            />
            {health?.neo4j?.is_connected
              ? (health.neo4j.message?.includes("Aura") ? "AURA CLOUD" : "CONNECTED")
              : "FALLBACK"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-muted)] pt-1.5 border-t border-[var(--border-subtle)]">
          <Shield className="w-3.5 h-3.5 text-[var(--brand-sage)] shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] text-[var(--text-primary)] font-medium block truncate">
              Zero-Execution Active
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block truncate">
              Static AST Air-Gap
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
