"use client";

import Link from "next/link";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 pt-20 md:pt-24 space-y-10 md:space-y-12">
            <div className="w-full text-left space-y-8 z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl relative z-20"
                >
                    <span>←</span> Dashboard
                </Link>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">Trends & <span className="text-blue-500">History</span></h1>
                    <p className="text-zinc-500 text-sm md:text-base font-medium">Weekly longitudinal analysis of your health data.</p>
                </div>
            </div>

            <div className="w-full">
                <TrendsSplitView />
            </div>


        </main>
    );
}
