"use client";

import Link from "next/link";
import Image from "next/image";
import GlucoseForm from "../components/GlucoseForm";
import GlucoseHistory from "../components/GlucoseHistory";
import GlucoseChart from "../components/GlucoseChart";
import InsightCard from "../components/InsightCard";
import DexcomConnect from "../components/DexcomConnect";
import { useState, Suspense } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 space-y-8">

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Diabetes <span className="text-blue-500">Companion V1.2.3</span>
        </h1>
        <p className="text-zinc-500 text-sm">
          Track your levels, gain insights.
        </p>

      </div>

      {/* Main Form */}
      <GlucoseForm onReadingSaved={() => setRefreshKey(prev => prev + 1)} />

      {/* Charts */}
      <GlucoseChart refreshTrigger={refreshKey} />
      <div className="w-full flex justify-end px-4 mt-4 mb-8 relative z-20">
        <a
          href="/trends"
          className="cursor-pointer text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/20 px-4 py-2 rounded-full border border-blue-800/50 hover:bg-blue-900/40 transition-all shadow-lg active:scale-95"
        >
          View Detailed Trends →
        </a>
      </div>

      {/* Integrations */}
      <Suspense fallback={<div className="text-zinc-500 text-sm">Loading Dexcom integration...</div>}>
        <DexcomConnect />
      </Suspense>

      {/* AI Insights */}
      <InsightCard />

      {/* History Section */}
      <GlucoseHistory refreshTrigger={refreshKey} />


    </main>
  );
}
