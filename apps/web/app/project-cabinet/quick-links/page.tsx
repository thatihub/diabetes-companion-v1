"use client";

import Link from "next/link";

export default function QuickLinksPage() {
    return (
        <main className="flex min-h-screen flex-col items-start p-6 space-y-8 max-w-4xl mx-auto">
            <div className="w-full flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-4">
                <Link href="/project-cabinet" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Cabinet</Link>
                <h1 className="text-xl font-bold text-white">⚡️ Quick Links & Ops</h1>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg prose prose-invert max-w-none text-zinc-300">

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🌐 Production (Public)</h2>
                    <p className="mb-4">These are live on the internet. Note: Render Free Tier <strong>sleeps after 15m</strong> of inactivity.</p>
                    <ul className="space-y-3">
                        <li>
                            <strong>Web App:</strong> <a href="https://diabetes-companion-web.onrender.com" target="_blank" className="text-blue-400 hover:underline">https://diabetes-companion-web.onrender.com</a>
                            <br /><span className="text-zinc-500 text-xs italic">If "Application Error", wait 60s and refresh.</span>
                        </li>
                        <li>
                            <strong>API Health Check:</strong> <a href="https://diabetes-companion-api.onrender.com" target="_blank" className="text-blue-400 hover:underline">https://diabetes-companion-api.onrender.com</a>
                            <br /><span className="text-zinc-500 text-xs italic">Click manually to wake backend if Shortcuts timeout.</span>
                        </li>
                        <li>
                            <strong>Raw Data (7 Days):</strong> <a href="https://diabetes-companion-api.onrender.com/api/glucose?hours=168" target="_blank" className="text-blue-400 hover:underline">/api/glucose?hours=168</a>
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">💻 Local Development</h2>
                    <p className="mb-4">Use <code>127.0.0.1</code> to avoid Mac network timeouts.</p>
                    <ul className="space-y-3">
                        <li><strong>Web Dashboard:</strong> <a href="http://127.0.0.1:3001" target="_blank" className="text-blue-400 hover:underline">http://127.0.0.1:3001</a></li>
                        <li><strong>API Root:</strong> <a href="http://127.0.0.1:4000" target="_blank" className="text-blue-400 hover:underline">http://127.0.0.1:4000</a></li>
                        <li><strong>Raw JSON (7 Days):</strong> <a href="http://127.0.0.1:4000/api/glucose?hours=168" target="_blank" className="text-blue-400 hover:underline">/api/glucose?hours=168</a></li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🩸 Dexcom G7 Integration</h2>

                    <h3 className="text-lg font-bold text-white mt-4 mb-2">🔗 Connect / Re-Authenticate</h3>
                    <p>Click this to start the OAuth flow:</p>
                    <p className="py-2">
                        👉 <a href="http://127.0.0.1:4000/api/dexcom/login" target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold inline-block transition-colors">Authorize Dexcom</a>
                    </p>

                    <h3 className="text-lg font-bold text-white mt-4 mb-2">⚙️ Switching Environments</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Open <code>apps/api/.env</code></li>
                        <li>Toggle <code>DEXCOM_BASE_URL</code> (comment/uncomment).</li>
                        <li>Restart API: <code>npm run start:api</code></li>
                    </ol>

                    <h3 className="text-lg font-bold text-white mt-4 mb-2">⚠️ Troubleshooting "0 Readings"</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Provisioning Delay:</strong> Takes 24-48h for new Client IDs.</li>
                        <li><strong>Check Clarity:</strong> Ensure app is uploading to Clarity.</li>
                        <li><strong>Ghost Login:</strong> Use Incognito mode if stuck on Sandbox login.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-700 pb-2">🛠 Operations</h2>

                    <h3 className="text-lg font-bold text-white mt-4 mb-2">🔄 Restart Servers</h3>
                    <ul className="list-disc pl-5 space-y-2 font-mono text-sm">
                        <li><code>npm run start:api</code> (API Only)</li>
                        <li><code>npm run dev:web</code> (Web Only)</li>
                        <li><code>npm run dev</code> (Both)</li>
                    </ul>

                    <h3 className="text-lg font-bold text-white mt-4 mb-2">📂 Database</h3>
                    <p>Stored in Supabase via Postgres.</p>
                    <ul className="list-disc pl-5 space-y-2 font-mono text-sm">
                        <li>Clear Data: <code>node apps/api/clear-db.js</code></li>
                    </ul>
                </section>

            </div>
        </main>
    );
}
