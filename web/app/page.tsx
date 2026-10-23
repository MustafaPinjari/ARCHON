"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchHealth,
  validateRepository,
  indexRepository,
  fetchSymbols,
  runInvestigation,
  fetchGraph,
  runImpactAnalysis,
  fetchEvaluation,
} from "@/lib/api";
import type {
  HealthStatus,
  ValidationResponse,
  SymbolItem,
  InvestigationResult,
  FlowGraph,
  ImpactReport,
  EvaluationSummary,
  TabId,
  EvidenceTabId,
  RepoMode,
  NavItem,
} from "@/lib/types";
import {
  FolderGit2,
  Search,
  Network,
  AlertTriangle,
  Award,
  Terminal,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandCenterTab } from "@/components/tabs/CommandCenterTab";
import { ExplorerTab } from "@/components/tabs/ExplorerTab";
import { InvestigationTab } from "@/components/tabs/InvestigationTab";
import { GraphTab } from "@/components/tabs/GraphTab";
import { ImpactTab } from "@/components/tabs/ImpactTab";
import { EvaluationTab } from "@/components/tabs/EvaluationTab";

const NAV_ITEMS: NavItem[] = [
  { id: "command", label: "Command Center", icon: Terminal },
  { id: "explorer", label: "Repository Explorer", icon: FolderGit2 },
  { id: "investigation", label: "Investigation Workspace", icon: Search },
  { id: "graph", label: "Architecture Graph", icon: Network },
  { id: "impact", label: "Change Impact", icon: AlertTriangle },
  { id: "evaluation", label: "Evaluation & Trust", icon: Award },
];

export default function ArchonDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("command");

  // Telemetry & Workspace State
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [repoMode, setRepoMode] = useState<RepoMode>("demo");
  const [localPath, setLocalPath] = useState<string>("C:\\Users\\mustafa\\Desktop\\BAHub");
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexMessage, setIndexMessage] = useState<string | null>(null);

  // Symbols & Explorer State
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("TenantSubscription");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("Why was this function introduced?");
  const [customQuestion, setCustomQuestion] = useState<string>("");

  // Investigation Results State
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTabId>("git");

  // Graph State
  const [graphData, setGraphData] = useState<FlowGraph | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);

  // Impact Analysis State
  const [proposedChange, setProposedChange] = useState<string>("Modify expiration window and add distributed lock retry.");
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
  const [isAnalyzingImpact, setIsAnalyzingImpact] = useState(false);

  // Evaluation Benchmark State
  const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadGraph = useCallback(async (path?: string, symbol?: string) => {
    setIsGraphLoading(true);
    try {
      const data = await fetchGraph(path, symbol);
      setGraphData(data);
    } catch {
      // Offline fallback rendered by ArchitectureGraph
    } finally {
      setIsGraphLoading(false);
    }
  }, []);

  const loadSymbols = useCallback(async (path?: string) => {
    try {
      const targetPath = path ?? (repoMode === "local" ? localPath : "");
      const res = await fetchSymbols(targetPath);
      if (res.symbols && res.symbols.length > 0) {
        setSymbols(res.symbols);
        setSelectedSymbol(res.symbols[0].name);
      }
    } catch {
      // Ignored if API is unavailable
    }
  }, [repoMode, localPath]);

  useEffect(() => {
    let isMounted = true;

    async function checkHealthNow() {
      try {
        const h = await fetchHealth();
        if (isMounted) setHealth(h);
      } catch {
        // Handled gracefully if backend is restarting
      }
    }

    async function initWorkspace() {
      try {
        const [healthRes, demoRes] = await Promise.allSettled([
          fetchHealth(),
          runInvestigation({
            symbol: "charge_with_idempotency_key",
            question: "Why was this function introduced?",
            is_demo: true,
          }),
        ]);
        if (!isMounted) return;
        if (healthRes.status === "fulfilled") {
          setHealth(healthRes.value);
        }
        if (demoRes.status === "fulfilled") {
          setInvestigationResult(demoRes.value);
          setSelectedSymbol("charge_with_idempotency_key");
        }
      } catch {
        // Handled gracefully during initial startup
      }
    }

    initWorkspace();

    // Poll health status every 8 seconds so status flips automatically when backend restarts
    const interval = setInterval(checkHealthNow, 8000);
    window.addEventListener("focus", checkHealthNow);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", checkHealthNow);
    };
  }, []);

  const handleValidatePath = async (pathToCheck?: string) => {
    const target = pathToCheck || localPath;
    setIsValidating(true);
    try {
      const res = await validateRepository(target);
      setValidation(res);
      if (res.is_valid) {
        loadSymbols(target);
        loadGraph(target);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidation({
        is_valid: false,
        resolved_path: target,
        is_git_repo: false,
        git_branch: null,
        error_message: msg,
        scanned_files_count: 0,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleIndexRepository = async () => {
    if (!validation?.is_valid) return;
    setIsIndexing(true);
    setIndexMessage(null);
    try {
      const res = await indexRepository(localPath);
      setIndexMessage(`Indexed ${res.symbols_indexed} AST symbols & ${res.files_indexed} files into Neo4j.`);
      loadGraph(localPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setIndexMessage(`Indexing notice: ${msg}`);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleRunInvestigation = async (overrideSymbol?: string, overrideQuestion?: string) => {
    setIsInvestigating(true);
    const sym = overrideSymbol || selectedSymbol;
    const defaultQ = selectedQuestion === "Custom..." ? customQuestion : selectedQuestion;
    const q = overrideQuestion || defaultQ || "Why does this component exist?";
    try {
      const res = await runInvestigation({
        symbol: sym,
        question: q,
        repository_path: repoMode === "local" ? localPath : "",
        is_demo: repoMode === "demo",
      });
      setInvestigationResult(res);
      setActiveTab("investigation");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Investigation failed: ${msg}`);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleRunImpact = async () => {
    setIsAnalyzingImpact(true);
    try {
      const res = await runImpactAnalysis({
        symbol: selectedSymbol,
        proposed_change: proposedChange,
        repository_path: repoMode === "local" ? localPath : "",
      });
      setImpactReport(res);
      setActiveTab("impact");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Impact analysis failed: ${msg}`);
    } finally {
      setIsAnalyzingImpact(false);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetchEvaluation();
      setEvaluation(res);
      setActiveTab("evaluation");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Evaluation failed: ${msg}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleInvestigateFromGraph = (symbol: string) => {
    setSelectedSymbol(symbol);
    handleRunInvestigation(symbol, `Why was ${symbol} introduced and what invariants govern it?`);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
      <Sidebar
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        health={health}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)]">
        <Header
          repoMode={repoMode}
          onRepoModeChange={setRepoMode}
          localPath={localPath}
          onLocalPathChange={setLocalPath}
          validation={validation}
          isValidating={isValidating}
          onValidatePath={() => handleValidatePath()}
          isIndexing={isIndexing}
          onIndexRepo={handleIndexRepository}
          isInvestigating={isInvestigating}
          onRunInvestigation={handleRunInvestigation}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "command" && (
            <CommandCenterTab
              health={health}
              repoMode={repoMode}
              localPath={localPath}
              validation={validation}
              indexMessage={indexMessage}
              isIndexing={isIndexing}
              onNavigateTab={setActiveTab}
              onScanFiles={() => handleValidatePath()}
              onIndexRepo={handleIndexRepository}
            />
          )}

          {activeTab === "explorer" && (
            <ExplorerTab
              symbols={symbols}
              onSelectSymbol={(sym) => {
                setSelectedSymbol(sym);
                setActiveTab("investigation");
              }}
              onRefreshSymbols={() => loadSymbols()}
            />
          )}

          {activeTab === "investigation" && (
            <InvestigationTab
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              selectedQuestion={selectedQuestion}
              onQuestionChange={setSelectedQuestion}
              customQuestion={customQuestion}
              onCustomQuestionChange={setCustomQuestion}
              isInvestigating={isInvestigating}
              onRunInvestigation={handleRunInvestigation}
              investigationResult={investigationResult}
              evidenceTab={evidenceTab}
              onEvidenceTabChange={setEvidenceTab}
            />
          )}

          {activeTab === "graph" && (
            <GraphTab
              graphData={graphData}
              isGraphLoading={isGraphLoading}
              onRefreshGraph={() => loadGraph()}
              onInvestigateSymbol={handleInvestigateFromGraph}
            />
          )}

          {activeTab === "impact" && (
            <ImpactTab
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              proposedChange={proposedChange}
              onProposedChangeChange={setProposedChange}
              impactReport={impactReport}
              isAnalyzingImpact={isAnalyzingImpact}
              onRunImpact={handleRunImpact}
            />
          )}

          {activeTab === "evaluation" && (
            <EvaluationTab
              evaluation={evaluation}
              isEvaluating={isEvaluating}
              onRunEvaluation={handleRunEvaluation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
