"use client";

import Link from "next/link";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header / Nav */}
            <div className="px-6 pt-10 mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl text-slate-400 hover:text-teal-400 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Dashboard
                </Link>

                <div className="mt-10">
                    <h1 className="text-4xl font-black text-slate-100 tracking-tighter">Trends & <span className="text-teal-400">Activity</span></h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Longitudinal Metabolic Health</p>
                </div>
            </div>

            <main className="flex-1 pb-20">
                <TrendsSplitView />
            </main>
        </div>
    );
}
