"use client";

import Link from "next/link";

export default function DexcomEmailParams() {
    return (
        <main className="flex min-h-screen flex-col items-start p-6 space-y-8 max-w-4xl mx-auto">
            <div className="w-full flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-4">
                <div className="flex gap-4 items-center">
                    <Link href="/project-cabinet" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Cabinet</Link>
                </div>
                <h1 className="text-xl font-bold text-white">Draft: Dexcom Support Email</h1>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg prose prose-invert max-w-none">
                <div className="p-4 bg-zinc-800 rounded-md border border-zinc-700 mb-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                    <p><strong className="text-white">To:</strong> developer.support@dexcom.com</p>
                    <p><strong className="text-white">Subject:</strong> Production V2 API: 'egvs' Endpoint Returning 0 Records despite DataRange Confirmation (Individual Access)</p>
                </div>

                <div className="text-zinc-300 leading-relaxed space-y-4">
                    <p>Hello Dexcom Developer Support,</p>

                    <p>I am building an "Individual Access" integration for my personal tracking app and encountering a specific issue with the Production V2 API.</p>

                    <h3 className="text-white font-bold text-lg mt-6">The Issue:</h3>
                    <p>Although I can successfully authenticate (OAuth2) and the <code className="bg-zinc-800 p-1 rounded text-pink-400">/dataRange</code> endpoint confirms that my account has recent data (up to today), requests to the <code className="bg-zinc-800 p-1 rounded text-pink-400">/egvs</code> endpoint specifically return an empty list (<code className="bg-zinc-800 p-1 rounded text-pink-400">[]</code>) with a <code className="bg-zinc-800 p-1 rounded text-pink-400">200 OK</code> status.</p>

                    <h3 className="text-white font-bold text-lg mt-6">Technical Details:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Client ID:</strong> <code className="text-green-400 bg-zinc-800 px-1 rounded">xUxYwCNC8irLb9OP6GMg2C5PlinH58jI</code></li>
                        <li><strong>Environment:</strong> Production (<code>https://api.dexcom.com</code>)</li>
                        <li><strong>Scopes Granted:</strong> <code>offline_access egv event calibration</code></li>
                    </ul>

                    <h3 className="text-white font-bold text-lg mt-6">Evidence of Discrepancy:</h3>
                    <ol className="list-decimal pl-5 space-y-4">
                        <li>
                            <strong>Data Range Request</strong> (<code>GET /v2/users/self/dataRange</code>):
                            <br />Response confirms data exists through <strong>Feb 3, 2026</strong>:
                            <pre className="bg-black p-3 rounded mt-2 text-xs border border-zinc-700 overflow-x-auto text-green-300">
                                {`"egvs": {
    "end": { "systemTime": "2026-02-03T06:45:49", "displayTime": "2026-02-02T22:45:49" }
}`}
                            </pre>
                        </li>
                        <li>
                            <strong>EGV Request</strong> (<code>GET /v2/users/self/egvs</code>):
                            <br />I am querying the exact window returned above (using UTC systemTime formatted strings):
                            <ul className="list-disc pl-5 mt-2">
                                <li><strong>URL:</strong> <code>https://api.dexcom.com/v2/users/self/egvs?startDate=2026-02-03T05:45:49&endDate=2026-02-03T06:45:49</code> (Tracing the last hour).</li>
                                <li><strong>Response:</strong> <code>200 OK</code></li>
                                <li><strong>Body:</strong> <code>{"{\"egvs\": [], \"unit\": \"mg/dL\", ...}"}</code></li>
                            </ul>
                        </li>
                    </ol>

                    <h3 className="text-white font-bold text-lg mt-6">Troubleshooting Steps Taken:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Verified access token is valid and has <code>egv</code> scope.</li>
                        <li>Tried multiple time windows: "Display Time" local windows, "System Time" UTC windows, and narrow windows around the last known calibration time.</li>
                        <li>All requests return <code>200 OK</code> but <code>0</code> records.</li>
                    </ul>

                    <p className="mt-6">Could you please verify if there is a permission flag or data-aging policy on this specific account/Client ID that is preventing the EGV stream from being served?</p>

                    <p className="mt-4">Thank you,<br />Prakash Thatikunta</p>
                </div>
            </div>
        </main>
    );
}
