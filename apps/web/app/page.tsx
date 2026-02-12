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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 space-y-10 md:space-y-12 pb-20">

      {/* Hero Section */}
      <div className="space-y-3 text-center pt-8">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">v1.2.4 — Live</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
          Diabetes <span className="text-blue-500">Companion</span>
        </h1>
        <p className="text-zinc-500 text-sm md:text-base font-medium max-w-xs mx-auto">
          Precision monitoring & AI-driven metabolic insights.
        </p>
      </div>

      {/* Main Form */}
      <GlucoseForm onReadingSaved={() => setRefreshKey(prev => prev + 1)} />

      {/* Charts Section */}
      <div className="w-full max-w-2xl space-y-6">
        <GlucoseChart refreshTrigger={refreshKey} />
        <div className="flex justify-center md:justify-end px-2">
          <Link
            href="/trends"
            className="group cursor-pointer text-[10px] font-black text-blue-400 hover:text-white flex items-center gap-2 bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20 hover:bg-blue-600 transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em]"
          >
            Detailed Longitudinal Trends
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Integrations & Insights */}
      <div className="w-full max-w-sm space-y-8">
        <Suspense fallback={<div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Initializing Dexcom...</div>}>
          <DexcomConnect />
        </Suspense>

        <InsightCard />
      </div>

      {/* History Section */}
      <GlucoseHistory refreshTrigger={refreshKey} />

      {/* Footer Branding */}
      <div className="pt-8 opacity-20">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] text-center">Automata Health Systems</p>
      </div>
    </main>
  );
}
