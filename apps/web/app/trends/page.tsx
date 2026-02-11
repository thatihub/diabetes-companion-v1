"use client";

import Link from "next/link";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-6 pt-12 space-y-8">
            <div className="w-full text-left space-y-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
                >
                    <span>←</span> Dashboard
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Trends & History</h1>
                    <p className="text-zinc-500 text-sm">Weekly breakdown of your health journey.</p>
                </div>
            </div>

            <div className="w-full">
                <TrendsSplitView />
            </div>


        </main>
    );
}
