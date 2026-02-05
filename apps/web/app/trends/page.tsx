"use client";

import { useEffect, useState } from "react";
import TrendsSplitView from "../../components/TrendsSplitView";

export default function TrendsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-6 space-y-8">
            <div className="w-full text-left">
                <h1 className="text-3xl font-bold text-white mb-2">Trends & History</h1>
                <p className="text-zinc-500">Weekly breakdown of your glucose history.</p>
            </div>

            <div className="w-full">
                <TrendsSplitView />
            </div>


        </main>
    );
}
