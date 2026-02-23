"use client";

import Link from "next/link";
import { useState } from "react";

const COMMITS = [
    { hash: "4f2e9d1", date: "2026-02-22", message: "Fix: Resolve API proxy mismatch, hydration errors, and optimize data limits" },
    { hash: "1cf1a26", date: "2026-02-22", message: "Feat: Unify Premium UI with Auto-Sync engine and clean Render URLs" },
    { hash: "e2f0a12", date: "2026-02-11", message: "UI: Premium mobile overhaul for Trends, History, and AI Insights (v1.2.4)" },
    { hash: "f9b8c77", date: "2026-02-11", message: "Fix: Harden API against 500 errors and increase payload limit to 5MB" },
];

export default function ProjectCabinetPage() {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <main className="min-h-screen bg-[#020202] text-zinc-100 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Header Section */}
                <header className="space-y-8 pt-12">
                    <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all shadow-xl active:scale-95">
                        ← Exit to Terminal
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none">
                                Tech <span className="text-indigo-500 italic">Cabinet</span>
                            </h1>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                Diabetes Companion V1.2.7 — Central repository for architectural manifests and operational telemetry.
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-4">
                            <div className="flex gap-2">
                                <span className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-[0_0_20px_-5px_#10b981]">
                                    ● System Active
                                </span>
                                <span className="px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                                    Release 1.2.7
                                </span>
                            </div>
                            <div className="md:text-right px-2">
                                <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] mb-1">Latest Commit Sync</p>
                                <span className="text-xs text-red-500 font-bold">DEBUG_BUILD_12345</span>
                                {/* VERIF_20260222_0120 */}
                                <p className="text-xs font-black text-zinc-500">Feb 22, 2026 — <code className="text-indigo-500/80 font-mono">4f2e9d1</code></p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Core Repository Links */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="https://diabetes-companion-web.onrender.com" target="_blank" className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-indigo-500/30 rounded-3xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">↗</div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Web Application</h4>
                        <p className="text-white font-bold text-lg">Live Frontend</p>
                    </a>
                    <a href="https://diabetes-companion-api.onrender.com" target="_blank" className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-emerald-500/30 rounded-3xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">↗</div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">API Service</h4>
                        <p className="text-white font-bold text-lg">Backend Engine</p>
                    </a>
                    <a href="https://github.com/thatihub/diabetes-companion-v1" target="_blank" className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-white/20 rounded-3xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">↗</div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Source Code</h4>
                        <p className="text-white font-bold text-lg">GitHub Repo</p>
                    </a>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Documentation & Tasks */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-sm border border-zinc-800">📂</span>
                            System Assets
                        </h2>
                        <div className="space-y-4">
                            <Link href="/project-cabinet/dexcom-email" className="block group p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 hover:border-indigo-500/30 transition-all">
                                <h3 className="text-lg font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">Dexcom Support Email</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Ready-to-use template for production key requests and developer operations.
                                </p>
                            </Link>

                            <Link href="/project-cabinet/quick-links" className="block group p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 hover:border-emerald-500/30 transition-all">
                                <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Quick Reference</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Central manifest for database credentials, environment variables, and dev commands.
                                </p>
                            </Link>
                        </div>
                    </section>

                    {/* Change Log Preview */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-sm border border-zinc-800">✨</span>
                            Latest Refinements
                        </h2>
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />

                            <div className="relative space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-base font-black text-white">V1.2.6: Production Stabilization</h4>
                                    <ul className="text-sm text-zinc-500 space-y-2 list-disc pl-5">
                                        <li>Fixed Next.js API Proxy routing for Render deployments.</li>
                                        <li>Implemented Server-Side Data Sampling (fixes 90D chart timeouts).</li>
                                        <li>Eliminated Hydration errors caused by Dark Mode extensions.</li>
                                    </ul>
                                </div>
                                <div className="space-y-1 pt-4 border-t border-zinc-900">
                                    <h4 className="text-base font-black text-zinc-400">V1.2.4: The UI Revision</h4>
                                    <p className="text-sm text-zinc-600">Premium mobile overhaul for Trends and high-contrast metabolic charts.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Git History (Collapsible) */}
                <section className="pt-10 border-t border-zinc-900">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between py-6 group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500 group-hover:text-white group-hover:border-zinc-700 transition-all">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v8l3.5 3.5"></path>
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-black text-zinc-300 group-hover:text-white transition-colors">Git Commit Trace</h3>
                                <p className="text-sm font-medium text-zinc-600">Explore the granular evolution of the codebase</p>
                            </div>
                        </div>
                        <span className={`text-zinc-700 text-3xl transition-transform duration-500 font-light ${showHistory ? 'rotate-180 text-white' : ''}`}>
                            ↓
                        </span>
                    </button>

                    {showHistory && (
                        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-8 duration-700 ease-out pb-20">
                            {COMMITS.map((commit) => (
                                <div key={commit.hash} className="group relative pl-8 border-l border-zinc-900 pb-8 last:pb-0">
                                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-300" />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <code className="text-[10px] font-black font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">{commit.hash}</code>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-700">{commit.date}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm font-medium leading-relaxed group-hover:text-zinc-200 transition-colors">{commit.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-8 text-center">
                                <a
                                    href="https://github.com/thatihub/diabetes-companion-v1/commits/main"
                                    target="_blank"
                                    className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    Full GitHub History Source
                                </a>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
