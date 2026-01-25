"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import BaseGlucoseChart from "../../components/BaseGlucoseChart";
import InsightCard from "../../components/InsightCard";
import GlucoseHistory from "../../components/GlucoseHistory";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
};

type SeriesPoint = GlucosePoint & {
    time: string;
    timestamp: number;
};

type Bucket = {
    start: Date;
    end: Date;
    data: SeriesPoint[];
    label: string;
};

type Range = "7d" | "14d" | "30d" | "90d";

export default function TrendsPage() {
    const [range, setRange] = useState<Range>("30d");
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine total days
                let days = 30;
                if (range === "7d") days = 7;
                if (range === "14d") days = 14;
                if (range === "90d") days = 90;

                const hours = days * 24;

                // Fetch plenty of points to ensure we have coverage
                const points = await api.get<GlucosePoint[]>(`/api/glucose?hours=${hours}&limit=5000`);

                // Create buckets
                // We want to slice time into 7-day chunks backwards from now.
                const now = new Date();
                const newBuckets: Bucket[] = [];

                let currentEnd = now;

                // Adjust loop for small ranges (at least 1 bucket)
                for (let i = 0; i < days; i += 7) {
                    const start = new Date(currentEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

                    // Filter points for this bucket
                    const chunk = points.filter(p => {
                        const t = new Date(p.measured_at).getTime();
                        return t >= start.getTime() && t <= currentEnd.getTime();
                    });

                    // Sort chunk by time (oldest first) and format
                    const sortedChunk: SeriesPoint[] = chunk
                        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
                        .map(p => ({
                            ...p,
                            time: new Date(p.measured_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                            timestamp: new Date(p.measured_at).getTime()
                        }));

                    newBuckets.push({
                        start,
                        end: currentEnd,
                        data: sortedChunk,
                        label: `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${currentEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                    });

                    currentEnd = start;
                }

                setBuckets(newBuckets);
                setSelectedBucket(null);
            } catch (err) {
                console.error("Failed to load trends data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    // Dynamic grid classes based on bucket count
    // 1 bucket (7d): Full width, centered
    // 2 buckets (14d): 2 columns
    // 4-5 buckets (30d): 2 columns
    // 12-13 buckets (90d): 3 or 4 columns
    const gridClass = buckets.length === 1 ? "grid-cols-1" :
        buckets.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
            buckets.length <= 5 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" :
                "grid-cols-1 md:grid-cols-3 lg:grid-cols-4"; // 90d

    // Adjust height based on density to try and fit on screen
    const chartHeightClass = buckets.length > 5 ? "h-24" : "h-32";

    return (
        <main className="flex min-h-screen flex-col items-center p-6 space-y-6 bg-black">
            {/* Header / Nav */}
            <div className="w-full max-w-6xl flex items-center justify-between">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1">
                    ← Back
                </Link>
                <h1 className="text-xl font-bold text-white tracking-tight">Trends & Analysis</h1>
                <div className="w-10"></div>
            </div>

            {/* Top Analysis Section */}
            <div className="w-full max-w-6xl">
                <InsightCard
                    title={range === "7d" ? "✨ Weekly Analysis" : "✨ Trend Analysis"}
                    context={range === "7d" ? "weekly" : "comparison"}
                    startDate={buckets.length > 0 ? buckets[buckets.length - 1].start.toISOString() : undefined}
                    endDate={buckets.length > 0 ? buckets[0].end.toISOString() : undefined}
                />
            </div>

            {/* Weekly Comparison Section - Full Width Container */}
            <div className="w-full max-w-6xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Weekly Comparison</h2>
                    <div className="flex bg-zinc-900 rounded-lg p-1 overflow-x-auto">
                        {(["7d", "14d", "30d", "90d"] as Range[]).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap
                                    ${range === r ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
                        Loading analysis...
                    </div>
                ) : (
                    <div className={`grid gap-4 ${gridClass}`}>
                        {buckets.map((bucket, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedBucket(bucket)}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:border-zinc-600 hover:bg-zinc-900 transition-all"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-zinc-300 text-xs font-medium">{bucket.label}</span>
                                    <span className="text-zinc-500 text-[10px] text-right">
                                        avg: {bucket.data.length > 0
                                            ? Math.round(bucket.data.reduce((acc, curr) => acc + curr.glucose_mgdl, 0) / bucket.data.length)
                                            : '--'}
                                    </span>
                                </div>
                                <div className={`${chartHeightClass} w-full -ml-2 pointer-events-none`}>
                                    {bucket.data.length > 0 ? (
                                        <BaseGlucoseChart
                                            data={bucket.data}
                                            height="100%"
                                            showXAxis={false} // Clean look for stacked charts
                                            showYAxis={true}
                                            showGrid={true}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-zinc-700 text-xs italic">
                                            No data
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Existing History Section */}
            <div className="w-full max-w-6xl">
                <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Detailed History</h2>
                <GlucoseHistory />
            </div>

            {/* Modal Overlay */}
            {selectedBucket && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedBucket(null)}
                >
                    <div
                        className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedBucket(null)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">{selectedBucket.label}</h2>
                            <p className="text-zinc-400">
                                Average Glucose: <span className="text-white font-medium">
                                    {selectedBucket.data.length > 0
                                        ? Math.round(selectedBucket.data.reduce((acc, curr) => acc + curr.glucose_mgdl, 0) / selectedBucket.data.length)
                                        : '--'} mg/dL
                                </span>
                            </p>
                        </div>

                        <div className="h-[300px] w-full mb-6">
                            <BaseGlucoseChart
                                data={selectedBucket.data}
                                height="100%"
                                showXAxis={true}
                                showYAxis={true}
                                showGrid={true}
                            />
                        </div>

                        {/* Analysis for this specific bucket */}
                        <div className="border-t border-zinc-800 pt-6">
                            <InsightCard
                                title="✨ Analyze This Week"
                                context="weekly"
                                startDate={selectedBucket.start.toISOString()}
                                endDate={selectedBucket.end.toISOString()}
                            />
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
