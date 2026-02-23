"use client";

import Link from "next/link";
import GlucoseHistory from "../components/GlucoseHistory";
import GlucoseChart from "../components/GlucoseChart";
import InsightCard from "../components/InsightCard";
import DexcomConnect from "../components/DexcomConnect";
import { GlucoseHero } from "../components/GlucoseHero";
import { useState, Suspense, useEffect } from "react";
import { api } from "../lib/api";

type LatestGlucose = { glucose_mgdl: number };

export default function Home() {
  const [refreshKey] = useState(0);
  const [latestValue, setLatestValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await api.get<LatestGlucose[]>("/api/glucose?limit=1");
        if (data.length > 0) {
          setLatestValue(data[0].glucose_mgdl);
        }
      } catch (err) {
        console.error("Hero fetch failed", err);
      }
    };
    fetchLatest();
  }, [refreshKey]);

  return (
    <div className="app-page flex min-h-screen flex-col pt-4">
      {/* 1. Status Hero (Flo Inspired) */}
      <GlucoseHero currentValue={latestValue} />

      {/* 2. iPad-optimized dashboard grid */}
      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        <section className="space-y-6 md:col-span-8">
          <GlucoseChart refreshTrigger={refreshKey} />

          <div className="flex justify-center md:justify-start">
            <Link
              href="/trends"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-white bg-blue-600 border border-blue-500 hover:bg-blue-500 transition-all shadow-[0_10px_24px_rgba(37,99,235,0.35)] active:scale-95"
            >
              Detailed Analytics
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning={true}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="pb-8">
            <GlucoseHistory refreshTrigger={refreshKey} />
          </div>
        </section>

        <aside className="space-y-6 md:col-span-4 md:sticky md:top-24">
          <div className="wellness-card p-6">
            <Suspense fallback={<div className="h-20 animate-pulse bg-slate-800/30 rounded-3xl"></div>}>
              <DexcomConnect />
            </Suspense>
          </div>

          <InsightCard />
        </aside>
      </div>

      {/* Footer */}
      <div className="py-10 border-t border-slate-800/30 bg-slate-900/10 mt-4">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] text-center">
          GlycoFlow Metabolic Intelligence
        </p>
      </div>
    </div>
  );
}
