"use client";

import Link from "next/link";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-6 pt-12 space-y-8">
            <div className="w-full text-left space-y-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                    <span>←</span> Back to Dashboard
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Trends & History</h1>
                    <p className="text-zinc-500">Weekly breakdown of your glucose history.</p>
                </div>
            </div>

            <div className="w-full">
                <TrendsSplitView />
            </div>


        </main>
    );
}
