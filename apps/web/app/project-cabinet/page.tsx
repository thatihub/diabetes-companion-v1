"use client";

import Link from "next/link";

export default function ProjectCabinetPage() {
    return (
        <main className="flex min-h-screen flex-col items-start p-6 space-y-8 max-w-4xl mx-auto">
            <div className="w-full flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-4">
                <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Dashboard</Link>
                <h1 className="text-xl font-bold text-white">🗄️ Project Cabinet</h1>
            </div>

            <div className="w-full prose prose-invert max-w-none">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Diabetes Companion V1 (Version 1.2.0)</h2>
                    <ul className="list-disc pl-5 text-zinc-400 space-y-2 mb-6">
                        <li><strong>Status:</strong> 🟢 Feature Complete (Dexcom Mock / Production Ready)</li>
                        <li><strong>Last Updated:</strong> Feb 04, 2026</li>
                        <li><strong>Stable Commit:</strong> (Pending Push)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mb-3">🚀 Key Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <a href="https://diabetes-companion-web.onrender.com" target="_blank" className="p-3 bg-zinc-800 rounded-lg text-blue-400 hover:text-blue-300 block">Web App (Prod)</a>
                        <a href="https://diabetes-companion-api.onrender.com" target="_blank" className="p-3 bg-zinc-800 rounded-lg text-blue-400 hover:text-blue-300 block">API Endpoint (Prod)</a>
                        <a href="https://github.com/StartAgain001/diabetes-companion/blob/main/PROJECT_CABINET.md" target="_blank" className="p-3 bg-zinc-800 rounded-lg text-blue-400 hover:text-blue-300 block">📄 View Source MD on GitHub</a>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3">📜 V1.2 Features (The Analytics Upgrade)</h3>
                    <ul className="list-disc pl-5 text-zinc-400 space-y-2 mb-6">
                        <li><strong>90-Day Analysis:</strong> Full history visualization supported (26k+ points).</li>
                        <li><strong>Split View:</strong> Weekly breakdowns for easy trend comparison.</li>
                        <li><strong>Auto-Stats:</strong> Avg Glucose & GMI calculation.</li>
                        <li><strong>AI Intelligence:</strong> "Analyze Trends" feature compares weeks.</li>
                        <li><strong>Backend:</strong> Hardened limits, Axios migration for stability.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-white mb-3">📂 Docs & Tasks</h3>
                    <div className="space-y-3">
                        <Link href="/project-cabinet/dexcom-email" className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors group">
                            <span className="text-pink-400 font-bold group-hover:underline">✉️ DEXCOM_SUPPORT_EMAIL_DRAFT.md</span>
                            <p className="text-zinc-500 text-sm mt-1">Ready to send. Click to view copy-pasteable draft.</p>
                        </Link>

                        <Link href="/project-cabinet/quick-links" className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors group">
                            <span className="text-green-400 font-bold group-hover:underline">⚡️ QUICK_LINKS.md</span>
                            <p className="text-zinc-500 text-sm mt-1">Production URLs, Local Ports, and Ops info.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
