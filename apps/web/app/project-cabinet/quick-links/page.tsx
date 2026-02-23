"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ServerIcon, ComputerDesktopIcon, WrenchIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

export default function QuickLinksPage() {
    return (
        <main className="app-page flex min-h-screen flex-col items-center pb-24 pt-6 space-y-10">

            {/* Nav Header */}
            <div className="app-panel w-full flex items-center justify-between gap-4 px-4 py-4">
                <Link
                    href="/project-cabinet"
                    className="app-btn"
                >
                    ← Cabinet Root
                </Link>
                <div className="flex flex-col items-end text-right">
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">
                        Ops <span className="text-emerald-500">Manifest</span>
                    </h1>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mt-1">V1.3.0 System Links</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                {/* PRODUCTION NODE */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <ServerIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Production Cloud</h2>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Live Assets on Render</p>
                        </div>
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    <div className="space-y-4">
                        <QuickLink
                            label="Master Dashboard"
                            url="https://diabetes-companion-web.onrender.com"
                            sub="Live User Interface"
                            color="emerald"
                        />
                        <QuickLink
                            label="API Health Pulse"
                            url="https://diabetes-companion-api.onrender.com"
                            sub="Backend Endpoint"
                            color="emerald"
                        />
                        <QuickLink
                            label="Longitudinal Data"
                            url="https://diabetes-companion-api.onrender.com/api/glucose?hours=168"
                            sub="7D Raw JSON Stream"
                            color="emerald"
                        />
                    </div>
                </section>

                {/* LOCAL NODE */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <ComputerDesktopIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Local Matrix</h2>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Development Workspace</p>
                        </div>
                        <span className="ml-auto text-[10px] font-black text-zinc-800 uppercase tracking-widest">127.0.0.1</span>
                    </div>

                    <div className="space-y-4">
                        <QuickLink
                            label="Web Preview (3001)"
                            url="http://127.0.0.1:3001"
                            sub="Local Development Instance"
                            color="blue"
                        />
                        <QuickLink
                            label="API Host (4000)"
                            url="http://127.0.0.1:4000"
                            sub="Local Server Core"
                            color="blue"
                        />
                        <QuickLink
                            label="Nexus Auth Entry"
                            url="http://127.0.0.1:4000/api/dexcom/login"
                            sub="Initialize Dexcom Node"
                            color="indigo"
                            highlight
                        />
                    </div>
                </section>

                {/* OPERATIONS CONTROL */}
                <section className="md:col-span-2 bg-[#0a0a0c] border border-zinc-900 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative space-y-10">
                        <div className="flex items-center gap-4">
                            <WrenchIcon className="h-6 w-6 text-indigo-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Protocol & Maintenance</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Initialize System</h3>
                                <div className="space-y-3">
                                    <div className="bg-black/40 border border-zinc-900 p-4 rounded-2xl font-mono text-xs">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                            <span className="text-zinc-600 uppercase tracking-widest text-[8px] font-black">Backend</span>
                                        </div>
                                        <code className="text-indigo-400 font-black">npm run start:api</code>
                                    </div>
                                    <div className="bg-black/40 border border-zinc-900 p-4 rounded-2xl font-mono text-xs">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            <span className="text-zinc-600 uppercase tracking-widest text-[8px] font-black">Frontend</span>
                                        </div>
                                        <code className="text-blue-400 font-black">npm run dev:web</code>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Telemetry Keys</h3>
                                <div className="space-y-3">
                                    <div className="bg-black/40 border border-zinc-900 p-4 rounded-2xl text-[11px] font-bold">
                                        <p className="text-white mb-1 leading-none uppercase tracking-tighter">Database Engine</p>
                                        <p className="text-zinc-600 truncate">Supabase Postgres Hyper-scale</p>
                                    </div>
                                    <div className="bg-black/40 border border-zinc-900 p-4 rounded-2xl text-[11px] font-bold">
                                        <p className="text-white mb-1 leading-none uppercase tracking-tighter">AI Processing</p>
                                        <p className="text-zinc-600 truncate">OpenAI GPT-4o Analysis Node</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function QuickLink({ label, url, sub, highlight, color = "blue" }: { label: string, url: string, sub?: string, highlight?: boolean, color?: "blue" | "emerald" | "indigo" }) {
    const [copied, setCopied] = useState(false);

    const colorClasses = {
        emerald: "hover:border-emerald-500/30 hover:bg-emerald-500/5 group-hover:text-emerald-400 text-emerald-500",
        blue: "hover:border-blue-500/30 hover:bg-blue-500/5 group-hover:text-blue-400 text-blue-500",
        indigo: "hover:border-indigo-500/30 hover:bg-indigo-500/5 group-hover:text-indigo-400 text-indigo-500"
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <a
            href={url}
            target="_blank"
            className={`flex flex-col p-5 rounded-[32px] transition-all group bg-[#0d0d0f] border border-zinc-900 shadow-xl relative overflow-hidden active:scale-95 ${highlight ? 'border-indigo-500/20 bg-indigo-500/5' : ''} ${colorClasses[color]}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-white tracking-tight uppercase italic">{label}</span>
                    {sub && <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</span>}
                </div>
                <ArrowTopRightOnSquareIcon className={`h-4 w-4 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${highlight ? 'text-indigo-400' : 'text-zinc-700'}`} />
            </div>

            <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 py-2 px-3 bg-black/60 rounded-xl border border-white/5 overflow-hidden">
                    <p className="text-[9px] font-mono text-zinc-500 truncate group-hover:text-zinc-300 transition-colors">
                        {url}
                    </p>
                </div>
                <button
                    onClick={handleCopy}
                    className={`p-2 rounded-xl border transition-all ${copied ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700'}`}
                    title="Copy Link"
                >
                    {copied ? <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" /> : <ClipboardDocumentIcon className="h-3.5 w-3.5" />}
                </button>
            </div>
        </a>
    );
}
