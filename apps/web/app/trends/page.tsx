"use client";

import { useEffect, useState } from "react";
import GlucoseChart from "../../components/GlucoseChart";

export default function TrendsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-6 space-y-8">
            <div className="w-full text-left">
                <h1 className="text-3xl font-bold text-white mb-2">Trends & History</h1>
                <p className="text-zinc-500">Deep dive into your last 90 days.</p>
            </div>

            {/* Reuse the main chart but maybe we will enhance it later to accept props for default range */}
            <div className="w-full">
                <GlucoseChart refreshTrigger={0} initialRange="7d" />
            </div>

            {/* Placeholder for Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-sm text-zinc-400">Average</h3>
                    <p className="text-2xl font-bold text-white">--</p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-sm text-zinc-400">GMI (Est. A1C)</h3>
                    <p className="text-2xl font-bold text-white">--</p>
                </div>
            </div>
        </main>
    );
}
