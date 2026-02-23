"use client";

import Link from "next/link";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <div className="app-page flex min-h-screen flex-col">
            {/* Header / Nav */}
            <div className="app-panel mb-8 px-6 py-6">
                <Link
                    href="/"
                    className="app-btn"
                >
                    <svg suppressHydrationWarning width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Dashboard
                </Link>

                <div className="mt-6">
                    <h1 className="text-4xl font-black text-slate-100 tracking-tighter">Trends & <span className="text-teal-400">Activity</span></h1>
                    <p className="app-label mt-2">Longitudinal Metabolic Health</p>
                </div>
            </div>

            <main className="flex-1 pb-20">
                <TrendsSplitView />
            </main>
        </div>
    );
}
