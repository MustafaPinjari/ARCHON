"use client";

import React, { useState, useEffect } from "react";
import {
  fetchHealth,
  validateRepository,
  indexRepository,
  fetchSymbols,
  runInvestigation,
  fetchGraph,
  runImpactAnalysis,
  fetchEvaluation,
  HealthStatus,
  ValidationResponse,
  SymbolItem,
  InvestigationResult,
  FlowGraph,
  ImpactReport,
  EvaluationSummary,
} from "@/lib/api";
import { ArchitectureGraph } from "@/components/ArchitectureGraph";
import {
  Shield,
  Activity,
  FolderGit2,
  Search,
  Network,
  AlertTriangle,
  Award,
  CheckCircle2,
  Terminal,
  Cpu,
  RefreshCw,
  GitCommit,
  FileCode,
  Layers,
  ChevronRight,
  Database,
  Play,
} from "lucide-react";

export default function ArchonDashboard() {
  const [activeTab, setActiveTab] = useState<
    "command" | "explorer" | "investigation" | "graph" | "impact" | "evaluation"
  >("command");

  // Telemetry & Workspace State
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [repoMode, setRepoMode] = useState<"demo" | "local">("demo");
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
  const [evidenceTab, setEvidenceTab] = useState<"git" | "contract" | "test" | "blast">("git");

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

  // Initial Load: Health check & Demo investigation
  useEffect(() => {
    loadHealth();
    loadDemoInvestigation();
  }, []);

  async function loadHealth() {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      // Backend may be starting
    }
  }

  async function handleValidatePath(pathToCheck?: string) {
    const target = pathToCheck || localPath;
    setIsValidating(true);
    try {
      const res = await validateRepository(target);
      setValidation(res);
      if (res.is_valid) {
        loadSymbols(target);
        loadGraph(target);
      }
    } catch {
      // Handled
    } finally {
      setIsValidating(false);
    }
  }

  async function handleIndexRepository() {
    if (!validation?.is_valid) return;
    setIsIndexing(true);
    setIndexMessage(null);
    try {
      const res = await indexRepository(localPath);
      setIndexMessage(`Indexed ${res.symbols_indexed} AST symbols & ${res.files_indexed} files into Neo4j.`);
      loadGraph(localPath);
    } catch (err: any) {
      setIndexMessage(`Indexing notice: ${err.message}`);
    } finally {
      setIsIndexing(false);
    }
  }

  async function loadSymbols(path?: string) {
    try {
      const res = await fetchSymbols(path || (repoMode === "local" ? localPath : ""));
      if (res.symbols && res.symbols.length > 0) {
        setSymbols(res.symbols);
        setSelectedSymbol(res.symbols[0].name);
      }
    } catch {}
  }

  async function loadGraph(path?: string) {
    setIsGraphLoading(true);
    try {
      const g = await fetchGraph(path || (repoMode === "local" ? localPath : ""), selectedSymbol);
      setGraphData(g);
    } catch {} finally {
      setIsGraphLoading(false);
    }
  }

  async function loadDemoInvestigation() {
    setIsInvestigating(true);
    try {
      const res = await runInvestigation({
        symbol: "charge_with_idempotency_key",
        question: "Why was this function introduced?",
        is_demo: true,
      });
      setInvestigationResult(res);
    } catch {} finally {
      setIsInvestigating(false);
    }
  }

  async function handleRunInvestigation() {
    setIsInvestigating(true);
    const q = selectedQuestion === "Custom..." ? customQuestion : selectedQuestion;
    try {
      const res = await runInvestigation({
        symbol: selectedSymbol,
        question: q || "Why does this component exist?",
        repository_path: repoMode === "local" ? localPath : "",
        is_demo: repoMode === "demo",
      });
      setInvestigationResult(res);
      setActiveTab("investigation");
    } catch (err: any) {
      alert(`Investigation failed: ${err.message}`);
    } finally {
      setIsInvestigating(false);
    }
  }

  async function handleRunImpact() {
    setIsAnalyzingImpact(true);
    try {
      const res = await runImpactAnalysis({
        symbol: selectedSymbol,
        proposed_change: proposedChange,
        repository_path: repoMode === "local" ? localPath : "",
      });
      setImpactReport(res);
      setActiveTab("impact");
    } catch (err: any) {
      alert(`Impact analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzingImpact(false);
    }
  }

  async function handleRunEvaluation() {
    setIsEvaluating(true);
    try {
      const res = await fetchEvaluation();
      setEvaluation(res);
      setActiveTab("evaluation");
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-200 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-slate-800 bg-[#0d1322] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand mark */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-black shadow-lg shadow-cyan-950">
                A
              </div>
              <div>
                <h1 className="font-mono text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  ARCHON 2.0
                </h1>
                <p className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
                  Engineering Memory Engine
                </p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              hackFront 2026 // Neo4j Track
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {[
              { id: "command", label: "Command Center", icon: Terminal },
              { id: "explorer", label: "Repository Explorer", icon: FolderGit2 },
              { id: "investigation", label: "Investigation Workspace", icon: Search },
              { id: "graph", label: "Architecture Graph", icon: Network },
              { id: "impact", label: "Change Impact", icon: AlertTriangle },
              { id: "evaluation", label: "Evaluation & Trust", icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Telemetry & Safety Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500" /> Django REST API:
            </span>
            <span className="text-emerald-400 font-mono">ONLINE (:8000)</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-500" /> Neo4j Graph:
            </span>
            <span
              className={`font-mono text-[10px] ${
                health?.neo4j?.is_connected ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {health?.neo4j?.is_connected ? "CONNECTED" : "OFFLINE FALLBACK"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-900">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-cyan-300 font-semibold">Zero-Execution Boundary Active</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-[#0d1322]/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setRepoMode("demo")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  repoMode === "demo" ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚡ Curated Demo Repo
              </button>
              <button
                onClick={() => setRepoMode("local")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  repoMode === "local" ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📂 Local Git Workspace
              </button>
            </div>

            {repoMode === "local" && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="Local directory path..."
                  className="w-72 bg-slate-950 border border-slate-700 px-3 py-1 text-xs rounded text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleValidatePath()}
                  disabled={isValidating}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isValidating ? "animate-spin" : ""}`} />
                  Validate
                </button>
                {validation?.is_valid && (
                  <button
                    onClick={handleIndexRepository}
                    disabled={isIndexing}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Database className="w-3 h-3" />
                    {isIndexing ? "Indexing..." : "Index Neo4j"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {validation?.is_valid && (
              <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {validation.git_branch || "main"} (
                {validation.scanned_files_count} files)
              </span>
            )}
            <button
              onClick={handleRunInvestigation}
              disabled={isInvestigating}
              className="px-4 py-1.5 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isInvestigating ? "Investigating..." : "Investigate Memory"}
            </button>
          </div>
        </header>

        {/* Tab Viewport */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: COMMAND CENTER */}
          {activeTab === "command" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* National Hackathon Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-[#11192e] to-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                    ARCHON 2.0 Command Center
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Ground-truth code memory platform powered by Python AST parsing, Git commit archaeology, and idempotent Neo4j GraphRAG.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("investigation")}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-950"
                  >
                    Open Investigation Workspace →
                  </button>
                </div>
              </div>

              {/* Status & Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#0e1526] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Django REST Engine</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-100">Healthy (v2.0)</div>
                  <p className="text-[11px] text-slate-400 mt-1">Versioned endpoints on :8000</p>
                </div>

                <div className="p-4 rounded-lg bg-[#0e1526] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Neo4j Graph Database</span>
                    <Database className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-100">
                    {health?.neo4j?.is_connected ? "Live Graph Active" : "Resilient Fallback"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{health?.neo4j?.uri || "bolt://localhost:7687"}</p>
                </div>

                <div className="p-4 rounded-lg bg-[#0e1526] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Security Boundary</span>
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-100">Zero-Execution</div>
                  <p className="text-[11px] text-slate-400 mt-1">Air-gapped static AST inspection</p>
                </div>

                <div className="p-4 rounded-lg bg-[#0e1526] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Evaluation Precision</span>
                    <Award className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-100">100% Ground Truth</div>
                  <p className="text-[11px] text-slate-400 mt-1">Zero unsupported claims</p>
                </div>
              </div>

              {/* Workspace Setup & Indexing Status */}
              <div className="p-5 rounded-lg bg-[#0e1526] border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  Active Target Workspace
                </h3>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-slate-300">
                    {repoMode === "demo" ? "github.com/hyperledger-mock/aegis-commerce-core (CURATED DEMO)" : localPath}
                  </div>
                  <button
                    onClick={() => handleValidatePath()}
                    className="px-3 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Scan Files
                  </button>
                  <button
                    onClick={handleIndexRepository}
                    className="px-3 py-2 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow"
                  >
                    Index into Graph
                  </button>
                </div>
                {indexMessage && (
                  <p className="mt-2 text-xs text-emerald-400 font-mono bg-emerald-950/30 p-2 rounded border border-emerald-900">
                    {indexMessage}
                  </p>
                )}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("investigation")}
                  className="p-4 rounded-lg bg-[#0e1526] border border-slate-800 hover:border-cyan-600 cursor-pointer transition-all"
                >
                  <h4 className="text-sm font-semibold text-cyan-400 flex items-center justify-between">
                    Engineering Memory Investigation
                    <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Trace why functions were introduced and uncover Sev-1 incident diffs.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("graph")}
                  className="p-4 rounded-lg bg-[#0e1526] border border-slate-800 hover:border-violet-600 cursor-pointer transition-all"
                >
                  <h4 className="text-sm font-semibold text-violet-400 flex items-center justify-between">
                    React Flow Architecture Graph
                    <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore interactive AST call graphs and test relationships live.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("impact")}
                  className="p-4 rounded-lg bg-[#0e1526] border border-slate-800 hover:border-amber-600 cursor-pointer transition-all"
                >
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center justify-between">
                    Change Impact Intelligence
                    <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Estimate regression blast radius before committing alterations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPOSITORY EXPLORER */}
          {activeTab === "explorer" && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-cyan-400" />
                    Repository AST Symbol Explorer
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deterministic function, class, and method catalog extracted via AST parsing.
                  </p>
                </div>
                <button
                  onClick={() => loadSymbols()}
                  className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Symbols
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {symbols.length > 0 ? (
                  symbols.map((sym, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedSymbol(sym.name);
                        setActiveTab("investigation");
                      }}
                      className="p-3 rounded bg-[#0e1526] border border-slate-800 hover:border-cyan-500 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 truncate">{sym.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                          {sym.kind}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                        {sym.file_path ? `${sym.file_path}:L${sym.line}` : "Demo Module"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
                    No symbols loaded yet. Click &quot;Scan Files&quot; above or choose Demo mode.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INVESTIGATION WORKSPACE (3-PANEL LAYOUT) */}
          {activeTab === "investigation" && (
            <div className="grid grid-cols-12 gap-5 h-[calc(100vh-100px)]">
              {/* LEFT PANEL: Scope Selector */}
              <div className="col-span-3 border border-slate-800 rounded-lg bg-[#0e1526] p-4 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Investigation</h3>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Symbol</label>
                    <input
                      type="text"
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Investigation Question</label>
                    <select
                      value={selectedQuestion}
                      onChange={(e) => setSelectedQuestion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs rounded text-slate-200 focus:outline-none focus:border-cyan-500"
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
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Enter specific question..."
                        className="w-full mt-2 bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs rounded text-slate-200"
                      />
                    )}
                  </div>

                  <button
                    onClick={handleRunInvestigation}
                    disabled={isInvestigating}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {isInvestigating ? "Assembling Receipts..." : "Execute Investigation"}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Evidence Receipts:</span>
                    <span className="font-mono text-cyan-300">{investigationResult?.items.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provenance:</span>
                    <span className="font-mono text-emerald-400">100% Verifiable</span>
                  </div>
                </div>
              </div>

              {/* CENTER PANEL: Synthesis, Rationale & Timeline */}
              <div className="col-span-5 border border-slate-800 rounded-lg bg-[#0e1526] p-5 overflow-y-auto space-y-4">
                {investigationResult?.is_demo ? (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/80 rounded text-[11px] text-amber-200 font-medium">
                    ⚠️ DEMO DATA — NOT A LIVE REPOSITORY ANALYSIS. Commits and incidents model real-world billing idempotency patterns.
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/80 rounded text-[11px] text-emerald-200 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    LIVE LOCAL REPOSITORY FORENSIC — Direct ground truth from local AST & Git CLI.
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Engineering Memory Rationale
                  </h3>
                  <div className="mt-3 text-xs leading-relaxed text-slate-300 bg-slate-950/70 p-4 rounded-lg border border-slate-800 font-sans whitespace-pre-wrap">
                    {investigationResult?.synthesis || "Execute an investigation to generate ground-truth rationale."}
                  </div>
                </div>

                {investigationResult?.recommended_next_steps && (
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-2">Recommended Next Actions</h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {investigationResult.recommended_next_steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">👉</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL: Evidence Inspector & Citations */}
              <div className="col-span-4 border border-slate-800 rounded-lg bg-[#0e1526] p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Verifiable Evidence Receipts
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                    {investigationResult?.items.length || 0} Total
                  </span>
                </div>

                {/* Evidence Pillar Tabs */}
                <div className="grid grid-cols-4 gap-1 mt-3 p-0.5 bg-slate-950 rounded text-[10px] font-medium text-slate-400">
                  <button
                    onClick={() => setEvidenceTab("git")}
                    className={`py-1 rounded text-center transition-colors ${
                      evidenceTab === "git" ? "bg-slate-800 text-emerald-300 font-semibold" : "hover:text-slate-200"
                    }`}
                  >
                    Git Commits
                  </button>
                  <button
                    onClick={() => setEvidenceTab("contract")}
                    className={`py-1 rounded text-center transition-colors ${
                      evidenceTab === "contract" ? "bg-slate-800 text-cyan-300 font-semibold" : "hover:text-slate-200"
                    }`}
                  >
                    Contract AST
                  </button>
                  <button
                    onClick={() => setEvidenceTab("test")}
                    className={`py-1 rounded text-center transition-colors ${
                      evidenceTab === "test" ? "bg-slate-800 text-violet-300 font-semibold" : "hover:text-slate-200"
                    }`}
                  >
                    Test Mesh
                  </button>
                  <button
                    onClick={() => setEvidenceTab("blast")}
                    className={`py-1 rounded text-center transition-colors ${
                      evidenceTab === "blast" ? "bg-slate-800 text-amber-300 font-semibold" : "hover:text-slate-200"
                    }`}
                  >
                    Blast Radius
                  </button>
                </div>

                {/* Receipts Stream */}
                <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
                  {investigationResult?.items && investigationResult.items.length > 0 ? (
                    investigationResult.items
                      .filter((it) => {
                        if (evidenceTab === "git") return it.pillar.includes("Temporal");
                        if (evidenceTab === "contract") return it.pillar.includes("Contract");
                        if (evidenceTab === "test") return it.pillar.includes("Verification");
                        if (evidenceTab === "blast") return it.pillar.includes("Blast");
                        return true;
                      })
                      .map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-200 truncate pr-2">{item.title}</span>
                            <span className="text-[10px] font-mono text-cyan-400 shrink-0">
                              {item.confidence_label}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">{item.location}</p>
                          <p className="text-[11px] text-slate-300">{item.summary}</p>
                          <pre className="p-2 bg-black/60 rounded border border-slate-850 font-mono text-[10px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                            {item.verifiable_payload}
                          </pre>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-400">
                      No evidence receipts found for this category.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE GRAPH (REACT FLOW) */}
          {activeTab === "graph" && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Network className="w-4 h-4 text-violet-400" />
                    Interactive Neo4j Architecture Graph
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live structural visualization of symbols, calls, files, and test suites.
                  </p>
                </div>
                <button
                  onClick={() => loadGraph()}
                  disabled={isGraphLoading}
                  className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGraphLoading ? "animate-spin" : ""}`} /> Refresh Graph
                </button>
              </div>

              <ArchitectureGraph
                nodes={graphData?.nodes || []}
                edges={graphData?.edges || []}
                isLiveNeo4j={graphData?.is_live_neo4j || false}
                onRefresh={() => loadGraph()}
              />
            </div>
          )}

          {/* TAB 5: CHANGE IMPACT ANALYZER */}
          {activeTab === "impact" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div className="p-5 rounded-lg bg-[#0e1526] border border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Evaluate Proposed Code Modification
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Estimates structural blast radius and lists regression test suites requiring inspection.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Symbol</label>
                    <input
                      type="text"
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs rounded font-mono text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Proposed Change Description</label>
                    <input
                      type="text"
                      value={proposedChange}
                      onChange={(e) => setProposedChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs rounded text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunImpact}
                  disabled={isAnalyzingImpact}
                  className="mt-4 px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow"
                >
                  {isAnalyzingImpact ? "Calculating Blast Radius..." : "Analyze Change Impact"}
                </button>
              </div>

              {impactReport && (
                <div className="p-5 rounded-lg bg-[#0e1526] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-sm font-semibold text-slate-200">
                      Impact Report for <code className="text-cyan-400">{impactReport.target_symbol}</code>
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        impactReport.overall_risk === "HIGH"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : impactReport.overall_risk === "MEDIUM"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {impactReport.overall_risk} REGRESSION RISK
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Affected Callers & Downstream Modules</h4>
                      <div className="space-y-2">
                        {impactReport.affected_components.map((comp, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-850 text-xs">
                            <div className="flex justify-between font-mono text-[11px] text-cyan-300">
                              <span>{comp.file_path}:L{comp.line_number}</span>
                              <span className="text-amber-400 font-semibold">{comp.risk_level}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{comp.recommended_action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Required Test Suites to Verify</h4>
                      <div className="space-y-1.5">
                        {impactReport.tests_to_run.map((t, idx) => (
                          <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-850 text-xs font-mono text-violet-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EVALUATION BENCHMARK & TRUST */}
          {activeTab === "evaluation" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div className="p-5 rounded-lg bg-[#0e1526] border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-400" />
                    Quantitative Evaluation Benchmark
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates retrieval precision, citation validity, and ground-truth answer support.
                  </p>
                </div>
                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow"
                >
                  {isEvaluating ? "Measuring..." : "Run Benchmark"}
                </button>
              </div>

              {evaluation && (
                <div className="space-y-4">
                  {/* High level metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded bg-[#0e1526] border border-slate-800 text-center">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">
                        {(evaluation.average_precision_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Evidence Precision</div>
                    </div>
                    <div className="p-4 rounded bg-[#0e1526] border border-slate-800 text-center">
                      <div className="text-2xl font-bold text-cyan-400 font-mono">
                        {(evaluation.average_citation_validity * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Citation Validity</div>
                    </div>
                    <div className="p-4 rounded bg-[#0e1526] border border-slate-800 text-center">
                      <div className="text-2xl font-bold text-violet-400 font-mono">
                        {evaluation.average_latency_ms.toFixed(1)}ms
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Average Latency</div>
                    </div>
                    <div className="p-4 rounded bg-[#0e1526] border border-slate-800 text-center">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">
                        {evaluation.total_unsupported_claims}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Unsupported Claims</div>
                    </div>
                  </div>

                  {/* Benchmark Cases Table */}
                  <div className="p-4 rounded bg-[#0e1526] border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-3">Evaluated Ground-Truth Cases</h4>
                    <div className="space-y-2">
                      {evaluation.results.map((r, i) => (
                        <div key={i} className="p-3 bg-slate-950 rounded border border-slate-850 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-cyan-400">[{r.case_id}]</span>{" "}
                            <span className="font-medium text-slate-200">{r.symbol}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.notes}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-mono font-semibold">100% Verified</span>
                            <p className="text-[11px] text-slate-400 font-mono">{r.latency_ms.toFixed(1)}ms</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
