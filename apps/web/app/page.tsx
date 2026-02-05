"use client";

import Link from "next/link";
import Image from "next/image";
import GlucoseForm from "../components/GlucoseForm";
import GlucoseHistory from "../components/GlucoseHistory";
import GlucoseChart from "../components/GlucoseChart";
import InsightCard from "../components/InsightCard";
import DexcomConnect from "../components/DexcomConnect";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 space-y-8">

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Diabetes <span className="text-blue-500">Companion</span>
        </h1>
        <p className="text-zinc-500 text-sm">
          Track your levels, gain insights.
        </p>

      </div>

      {/* Main Form */}
      <GlucoseForm onReadingSaved={() => setRefreshKey(prev => prev + 1)} />

      {/* Charts */}
      <GlucoseChart refreshTrigger={refreshKey} />
      <div className="w-full flex justify-end px-4 -mt-2 mb-6">
        <Link href="/trends" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-800/50 hover:bg-blue-900/40 transition-all">
          View Detailed Trends →
        </Link>
      </div>

      {/* Integrations */}
      <DexcomConnect />

      {/* AI Insights */}
      <InsightCard />

      {/* History Section */}
      <GlucoseHistory refreshTrigger={refreshKey} />


    </main>
  );
}
