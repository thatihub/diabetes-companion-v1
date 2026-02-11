"use client";

import Link from "next/link";
import { useState } from "react";

const COMMITS = [
    { hash: "d0a1c13", date: "2026-02-10", message: "docs: update Project Cabinet status to v1.2.1 and redesign UI" },
    { hash: "64add38", date: "2026-02-09", message: "fix: resolve build issues and api proxy config for production" },
    { hash: "8ea3fd7", date: "2026-02-07", message: "fix: robust error handling for 502 errors and backend cold starts" },
    { hash: "8bcd3a7", date: "2026-02-07", message: "fix: CORS issue by using Next.js API proxy instead of direct backend calls" },
    { hash: "9ac8c34", date: "2026-02-07", message: "fix: Recharts rendering by removing ResponsiveContainer" },
    { hash: "3b65f76", date: "2026-02-06", message: "fix: Recharts SSR rendering issue by adding client-side mount check" },
];

export default function ProjectCabinetPage() {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <main className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="space-y-4 border-b border-zinc-800 pb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-400 transition-colors mb-2">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Project Cabinet</span>
                            </h1>
                            <p className="text-zinc-400 text-lg">Diabetes Companion V1</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                🟢 Production Ready
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                v1.2.1
                            </span>
                        </div>
                    </div>
                </header>

                {/* Status Cards - Adjusted Grid for Better Responsiveness */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm h-full">
                        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-4">Current Build</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Commit</span>
                                <code className="bg-zinc-800 px-2 py-0.5 rounded text-purple-300 font-mono">d0a1c13</code>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Deployed</span>
                                <span className="text-white">Feb 10, 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm lg:col-span-2 h-full">
                        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-4">Quick Links</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="https://diabetes-companion-web.onrender.com" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all group">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-blue-400 truncate pr-2">Web App (Prod)</span>
                                <span className="text-zinc-600 group-hover:text-blue-400 flex-none">↗</span>
                            </a>
                            <a href="https://diabetes-companion-api.onrender.com" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent transition-all group">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-purple-400 truncate pr-2">API Endpoint</span>
                                <span className="text-zinc-600 group-hover:text-purple-400 flex-none">↗</span>
                            </a>
                            <a href="https://github.com/thatihub/diabetes-companion-v1" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 hover:bg-gray-500/10 hover:border-gray-500/30 border border-transparent transition-all group sm:col-span-2 md:col-span-1">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white truncate pr-2">GitHub Repo</span>
                                <span className="text-zinc-600 group-hover:text-white flex-none">↗</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Documentation & Tasks */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>📂</span> Project Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/project-cabinet/dexcom-email" className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-pink-500/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-lg font-bold text-pink-400 mb-2 group-hover:text-pink-300">Dexcom Support Email</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Draft template for contacting Dexcom operations regarding API access and production keys.
                            </p>
                        </Link>

                        <Link href="/project-cabinet/quick-links" className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-green-500/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-lg font-bold text-green-400 mb-2 group-hover:text-green-300">Quick Reference</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Central hub for all production URLs, local ports, database credentials (safe), and ops commands.
                            </p>
                        </Link>
                    </div>
                </section>

                {/* Change Log Preview */}
                <section className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6">Latest Updates (v1.2.1)</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-none pt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">Critical Stability Fixes</h4>
                                <p className="text-sm text-zinc-500 mt-1">Resolved deployment pipeline issues, configured API proxying for production, and seeded the production database with initial data.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-none pt-1">
                                <div className="w-2 h-2 rounded-full bg-purple-500 ring-4 ring-purple-500/10" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">Merged Dexcom Integration</h4>
                                <p className="text-sm text-zinc-500 mt-1">Feature branch merged. OAuth flow is ready for production keys.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Git History (Collapsible) */}
                <section className="pt-4 border-t border-zinc-800/50">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <line x1="12" y1="5" x2="12" y2="9"></line>
                                    <line x1="12" y1="15" x2="12" y2="19"></line>
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white">Git Commit History</h3>
                                <p className="text-xs text-zinc-500">View recent changes and feature merges</p>
                            </div>
                        </div>
                        <span className={`text-zinc-500 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {showHistory && (
                        <div className="mt-4 pl-4 border-l-2 border-zinc-800 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            {COMMITS.map((commit, i) => (
                                <div key={commit.hash} className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-zinc-800 border-2 border-black ring-2 ring-zinc-800/50" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{commit.hash}</code>
                                            <span className="text-xs text-zinc-500">{commit.date}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300">{commit.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <a
                                    href="https://github.com/thatihub/diabetes-companion-v1/commits/main"
                                    target="_blank"
                                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    View full history on GitHub →
                                </a>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
