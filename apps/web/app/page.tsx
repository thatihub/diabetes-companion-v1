"use client";

import Link from "next/link";
import GlucoseHistory from "../components/GlucoseHistory";
import GlucoseChart from "../components/GlucoseChart";
import InsightCard from "../components/InsightCard";
import DexcomConnect from "../components/DexcomConnect";
import { GlucoseHero } from "../components/GlucoseHero";
import { useState, Suspense, useEffect } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [latestValue, setLatestValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await api.get<any[]>("/api/glucose?limit=1");
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
    <div className="flex flex-col min-h-screen">
      {/* 1. Status Hero (Flo Inspired) */}
      <GlucoseHero currentValue={latestValue} />

      {/* 2. Metabolic Insights Section */}
      <div className="px-6 space-y-8">
        <GlucoseChart refreshTrigger={refreshKey} />

        <div className="flex justify-center -translate-y-4">
          <Link
            href="/trends"
            className="flex items-center gap-3 px-8 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:bg-teal-500/20 transition-all shadow-lg active:scale-95"
          >
            Detailed Analytics
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      {/* 4. Timeline Section (Wellness Feed) */}
      <div className="pb-10 pt-4">
        <GlucoseHistory refreshTrigger={refreshKey} />
      </div>

      {/* 5. Integrations & Intelligence */}
      <div className="px-6 space-y-10 pb-20">
        <div className="wellness-card p-6">
          <Suspense fallback={<div className="h-20 animate-pulse bg-slate-800/30 rounded-3xl"></div>}>
            <DexcomConnect />
          </Suspense>
        </div>

        <InsightCard />
      </div>

      {/* 6. Professional Footer */}
      <div className="py-12 border-t border-slate-800/30 bg-slate-900/10">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] text-center">
          GlycoFlow Metabolic Intelligence
        </p>
      </div>
    </div>
  );
}
