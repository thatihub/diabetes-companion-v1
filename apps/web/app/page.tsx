"use client";

import Image from "next/image";
import GlucoseForm from "../components/GlucoseForm";
import GlucoseHistory from "../components/GlucoseHistory";
import GlucoseChart from "../components/GlucoseChart";
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
        <p className="text-[10px] text-zinc-700 font-mono mt-1">v1.0.12 (Bars Updated)</p>
      </div>

      {/* Main Form */}
      <GlucoseForm onReadingSaved={() => setRefreshKey(prev => prev + 1)} />

      {/* Charts */}
      <GlucoseChart refreshTrigger={refreshKey} />

      {/* History Section */}
      <GlucoseHistory refreshTrigger={refreshKey} />


    </main>
  );
}
