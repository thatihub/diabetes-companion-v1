"use client";

import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ServerIcon, ComputerDesktopIcon, BoltIcon, WrenchIcon } from "@heroicons/react/24/outline";

export default function QuickLinksPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="w-full flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-md sticky top-0 z-10">
                <div className="flex gap-4 items-center">
                    <Link href="/project-cabinet" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">← Back to Cabinet</Link>
                </div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-yellow-500" /> Quick Links & Ops
                </h1>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PRODUCTION CARD */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-800/30 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ServerIcon className="h-5 w-5 text-green-500" /> Production
                        </h2>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Live</span>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <p className="text-zinc-500 text-sm mb-4">Live links on Render. Sleep mode applies after 15m.</p>
                        <QuickLink
                            label="Web App (Dashboard)"
                            url="https://diabetes-companion-web.onrender.com"
                            sub="Main User Interface"
                        />
                        <QuickLink
                            label="API Health Check"
                            url="https://diabetes-companion-api.onrender.com"
                            sub="Wake up backend"
                        />
                        <QuickLink
                            label="Raw Data (7 Days)"
                            url="https://diabetes-companion-api.onrender.com/api/glucose?hours=168"
                            sub="JSON Response"
                        />
                    </div>
                </div>

                {/* LOCAL DEV CARD */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-800/30 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ComputerDesktopIcon className="h-5 w-5 text-blue-500" /> Local Dev
                        </h2>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded">127.0.0.1</span>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <p className="text-zinc-500 text-sm mb-4">Use local IPs to avoid Mac network timeouts.</p>
                        <QuickLink
                            label="Web Dashboard (3001)"
                            url="http://127.0.0.1:3001"
                            sub="Local Frontend"
                        />
                        <QuickLink
                            label="API Root (4000)"
                            url="http://127.0.0.1:4000"
                            sub="Local Backend"
                        />
                        <QuickLink
                            label="Authorize Dexcom"
                            url="http://127.0.0.1:4000/api/dexcom/login"
                            sub="Start OAuth Flow"
                            highlight
                        />
                    </div>
                </div>

                {/* TROUBLESHOOTING CARD */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg md:col-span-2">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <WrenchIcon className="h-5 w-5 text-purple-500" /> Operations & Troubleshooting
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Restart Servers</h3>
                            <ul className="space-y-2 text-sm font-mono text-zinc-400">
                                <li><code className="text-purple-400">npm run start:api</code> (Backend)</li>
                                <li><code className="text-blue-400">npm run dev:web</code> (Frontend)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Common Issues</h3>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                <li><strong className="text-white">0 Readings:</strong> Dexcom permission delay (24h).</li>
                                <li><strong className="text-white">Application Error:</strong> Refresh after 60s (Render waking up).</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

function QuickLink({ label, url, sub, highlight }: { label: string, url: string, sub?: string, highlight?: boolean }) {
    return (
        <a href={url} target="_blank" className={`flex items-center justify-between p-3 rounded-lg transition-all group ${highlight ? 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50' : 'bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50'}`}>
            <div className="flex flex-col">
                <span className={`font-medium ${highlight ? 'text-blue-200' : 'text-zinc-200 group-hover:text-white'}`}>{label}</span>
                {sub && <span className="text-xs text-zinc-500">{sub}</span>}
            </div>
            <ArrowTopRightOnSquareIcon className={`h-4 w-4 ${highlight ? 'text-blue-300' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
        </a>
    );
}
