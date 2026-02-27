"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import GlucoseGraph from "./GlucoseGraph";
import SpeakButton from "./SpeakButton";

type Range = "7d" | "14d" | "30d" | "90d";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
    time?: string;
    timestamp?: number;
};

type WeekSummary = { carbs: number; insulin: number };
type WeekData = { title: string; points: GlucosePoint[]; summary?: WeekSummary };
type WeekChunk = {
    title: string;
    startMs: number;
    endMs: number;
    raw: GlucosePoint[];
    points: GlucosePoint[];
    summary: WeekSummary;
};

export default function TrendsSplitView() {
    const [range, setRange] = useState<Range>("7d");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
    const [stats, setStats] = useState({ avg: 0, gmi: 0, cv: 0, tir: 0, lows: 0, highs: 0, totalCarbs: 0, totalInsulin: 0 });
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
    const [weekAnalysis, setWeekAnalysis] = useState<string | null>(null);
    const [analyzingWeek, setAnalyzingWeek] = useState(false);

    // Reset week analysis when switching weeks
    useEffect(() => {
        setWeekAnalysis(null);
    }, [selectedWeek]);

    useEffect(() => {
        if (!selectedWeek) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedWeek]);

    const ranges: Range[] = ["7d", "14d", "30d", "90d"];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysis(null);
        try {
            const res = await api.post<{ analysis: string }>("/api/insights/analyze", { range });
            setAnalysis(res.analysis);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            setAnalysis(`Failed to generate insights: ${message}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAnalyzeWeek = async () => {
        if (!selectedWeek) return;
        setAnalyzingWeek(true);
        setWeekAnalysis(null);
        try {
            const res = await api.post<{ analysis: string }>("/api/insights/analyze-week", {
                title: selectedWeek.title,
                data: selectedWeek.points
            });
            setWeekAnalysis(res.analysis);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            setWeekAnalysis(`Failed to generate weekly insights: ${message}`);
        } finally {
            setAnalyzingWeek(false);
        }
    };

    const getHours = (r: Range) => {
        switch (r) {
            case "7d": return 24 * 7;
            case "14d": return 24 * 14;
            case "30d": return 24 * 30;
            case "90d": return 24 * 90;
            default: return 24 * 7;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                const totalHours = getHours(range);
                // Fetch plenty of data
                const rawPoints = await api.get<GlucosePoint[]>(`/api/glucose?hours=${totalHours}&limit=20000`);
                const mode = typeof window !== "undefined" ? window.localStorage.getItem("data_mode") : "real";

                // Inferred carbs from insulin if carbs are missing (for demo/personal evaluation)
                const hasCarbs = rawPoints.some(p => (Number(p.carbs_grams) || 0) > 0);
                if (!hasCarbs) {
                    const ratio = 10; // g per unit
                    rawPoints.forEach(p => {
                        if (p.insulin_units && Number(p.insulin_units) > 0) {
                            p.carbs_grams = Number((Number(p.insulin_units) * ratio).toFixed(1));
                        }
                    });
                }
                // Calculate Stats
                if (rawPoints.length > 0) {
                    const glucoseValues = rawPoints.map(p => p.glucose_mgdl);
                    const sum = glucoseValues.reduce((acc, v) => acc + v, 0);
                    const avg = sum / glucoseValues.length;
                    const variance = glucoseValues.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / glucoseValues.length;
                    const sd = Math.sqrt(variance);
                    const cv = avg > 0 ? (sd / avg) * 100 : 0;
                    const gmi = 3.31 + (0.02392 * avg);

                    const totalCarbs = rawPoints.reduce((acc, p) => acc + (Number(p.carbs_grams) || 0), 0);
                    const totalInsulin = rawPoints.reduce((acc, p) => acc + (Number(p.insulin_units) || 0), 0);

                    const daysInPeriod = totalHours / 24;
                    const avgDailyCarbs = totalCarbs / daysInPeriod;
                    const avgDailyInsulin = totalInsulin / daysInPeriod;

                    const tirCount = glucoseValues.filter(v => v >= 70 && v <= 180).length;
                    const lows = glucoseValues.filter(v => v < 70).length;
                    const highs = glucoseValues.filter(v => v > 250).length;
                    const tir = Math.round((tirCount / glucoseValues.length) * 100);

                    setStats({
                        avg: Math.round(avg),
                        gmi: Number(gmi.toFixed(1)),
                        cv: Math.round(cv),
                        tir,
                        lows,
                        highs,
                        totalCarbs: Number(avgDailyCarbs.toFixed(1)),
                        totalInsulin: Number(avgDailyInsulin.toFixed(1))
                    });
                } else {
                    setStats({ avg: 0, gmi: 0, cv: 0, tir: 0, lows: 0, highs: 0, totalCarbs: 0, totalInsulin: 0 });
                }

                // Optimized Processing: One-pass grouping (O(N))
                const processingNow = rawPoints.length > 0
                    ? new Date(rawPoints[0].measured_at) // Use latest point as reference point
                    : new Date();

                const nowMs = processingNow.getTime();
                const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
                const chunks: WeekChunk[] = [];

                // Initialize chunks
                const weeks = Math.ceil(totalHours / (24 * 7));
                for (let i = 0; i < weeks; i++) {
                    const chunkEnd = new Date(nowMs - (i * oneWeekMs));
                    const chunkStart = new Date(nowMs - ((i + 1) * oneWeekMs));
                    chunks.push({
                        title: `Week ${i + 1} (${chunkStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${chunkEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })})`,
                        startMs: chunkStart.getTime(),
                        endMs: chunkEnd.getTime(),
                        raw: [],
                        points: [],
                        summary: { carbs: 0, insulin: 0 }
                    });
                }

                // Single pass distribution (O(N))
                rawPoints.forEach(p => {
                    const t = new Date(p.measured_at).getTime();
                    const weekIdx = Math.floor((nowMs - t) / oneWeekMs);
                    if (weekIdx >= 0 && weekIdx < chunks.length) {
                        chunks[weekIdx].raw.push(p);
                    } else if (weekIdx < 0) {
                        chunks[0].raw.push(p);
                    }
                });

                // Finalize chunks (reverse and sample for performance)
                chunks.forEach((chunk) => {
                    if (chunk.raw.length > 0) {
                        const totalCarbs = chunk.raw.reduce((acc, p) => acc + (Number(p.carbs_grams) || 0), 0);
                        const totalInsulin = chunk.raw.reduce((acc, p) => acc + (Number(p.insulin_units) || 0), 0);
                        chunk.summary = {
                            carbs: Number((totalCarbs / 7).toFixed(1)),
                            insulin: Number((totalInsulin / 7).toFixed(1))
                        };

                        // Intelligent Sampling for Chart Performance
                        const toProcess = chunk.raw.reverse();
                        const sampleRate = Math.ceil(toProcess.length / 800); // Target ~800 pts per week for smoothness

                        chunk.points = toProcess
                            .filter((_, idx) => idx % sampleRate === 0)
                            .map((p) => ({
                                ...p,
                                insulin_units: p.insulin_units !== null && p.insulin_units !== undefined ? Number(p.insulin_units) : undefined,
                                carbs_grams: p.carbs_grams !== null && p.carbs_grams !== undefined ? Number(p.carbs_grams) : undefined,
                                time: new Date(p.measured_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                timestamp: new Date(p.measured_at).getTime()
                            }));
                    }
                    delete chunk.raw; // Cleanup
                    delete chunk.startMs;
                    delete chunk.endMs;
                });

                setWeeklyData(chunks.filter(c => c.points.length > 0));

            } catch (err) {
                console.error("Failed to load trends data", err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setWeeklyData([]);
                setStats({ avg: 0, gmi: 0, cv: 0, tir: 0, lows: 0, highs: 0, totalCarbs: 0, totalInsulin: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    return (
        <div className="w-full">
            {/* Controls Row */}
            <div className="px-6 flex flex-col items-center mb-12 gap-8">
                {/* Range Selector - Centered Row */}
                <div className="flex bg-slate-800/40 p-2 rounded-[28px] border border-slate-700/50 backdrop-blur-md w-fit">
                    {ranges.map(r => (
                        <button
                            key={r}
                            onClick={() => { setRange(r); setAnalysis(null); }}
                            className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] rounded-[22px] transition-all
                                ${range === r ? 'bg-teal-500 text-slate-950 shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                {/* AI Action Button - Balanced and Centered */}
                <div className="w-full max-w-md px-6 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="ai-insight-btn group relative flex items-center justify-center gap-3"
                    >
                        <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {analyzing ? (
                            <>
                                <span className="animate-spin text-xl">✨</span> Generating AI Insight...
                            </>
                        ) : (
                            <>
                                <span className="text-xl">✨</span> Generate AI Insight
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* AI Analysis Result */}
            {analysis && (
                <div className="mx-6 wellness-card p-10 mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 shadow-[0_0_20px_#94d2bd]"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-teal-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4 bg-teal-500/5 px-6 py-3 rounded-full border border-teal-500/10">
                            <span className="text-xl">🤖</span> AI Pattern Analysis Diagnosis ({range})
                        </h3>
                        <button
                            onClick={() => setAnalysis(null)}
                            className="p-2 hover:bg-slate-700/50 rounded-full text-slate-500 transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        <div className="mb-4 flex justify-end">
                            <SpeakButton text={analysis} />
                        </div>
                        {analysis}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 mb-10">
                <div className="wellness-card p-5">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Avg Glucose / GMI</h3>
                    <p className="text-2xl font-black text-slate-100">{stats.avg > 0 ? stats.avg : '--'} mg/dL</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">GMI {stats.gmi > 0 ? stats.gmi : '--'}%</p>
                </div>
                <div className="wellness-card p-5">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Time In Range</h3>
                    <p className="text-2xl font-black text-teal-300">{stats.tir}%</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">Lows: {stats.lows} · Highs: {stats.highs}</p>
                </div>
                <div className="wellness-card p-5">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Variability (%CV)</h3>
                    <p className="text-2xl font-black text-amber-300">{stats.cv}%</p>
                </div>
                <div className="wellness-card p-5">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Daily Carbs / Insulin</h3>
                    <p className="text-2xl font-black text-teal-300">{stats.totalCarbs > 0 ? stats.totalCarbs : '--'} g</p>
                    <p className="text-[11px] font-bold text-rose-300 mt-1">{stats.totalInsulin > 0 ? stats.totalInsulin : '--'} u</p>
                </div>
            </div>

            {/* Graphs List */}
            {
                loading ? (
                    <div className="px-6 space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 w-full bg-slate-800/20 animate-pulse rounded-[32px]"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="px-6 py-10">
                        <div className="wellness-card p-10 text-center">
                            <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-6">⚠️ Protocol Deviation: {error}</p>
                            <button
                                onClick={() => setRange(range)}
                                className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-3xl"
                            >
                                Re-sync Data
                            </button>
                        </div>
                    </div>
                ) : weeklyData.length === 0 ? (
                    <div className="px-6 text-center text-slate-500 py-10 font-bold uppercase tracking-widest text-[10px]">Awaiting historical synchronization...</div>
                ) : (
                    <div className="pb-20">
                        {weeklyData.map((week, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedWeek(week)}
                                className="cursor-pointer active:scale-95 transition-transform"
                            >
                                <GlucoseGraph
                                    data={week.points}
                                    title={week.title}
                                    summary={week.summary}
                                    height={220}
                                />
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Weekly Focus Dialog */}
            {selectedWeek && typeof window !== "undefined" && createPortal((
                <div className="fixed left-0 top-0 z-[9999] h-[100dvh] w-screen bg-slate-950/95 backdrop-blur-sm p-3 md:p-6">
                    <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-950 shadow-[0_30px_80px_rgba(2,6,23,0.7)]">
                        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 md:px-8 md:py-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight text-slate-100 md:text-4xl">
                                    {selectedWeek.title.split(" (")[0]}
                                </h2>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {selectedWeek.title.split(" (")[1]?.replace(")", "")}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {selectedWeek.points.length} readings captured
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedWeek(null)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-slate-500 hover:text-white active:scale-95"
                                aria-label="Close weekly view"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
                            <div className="flex min-h-full flex-col gap-4">
                                {selectedWeek.summary && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-teal-700/30 bg-teal-950/20 px-4 py-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300/70">Avg Carbs</p>
                                            <p className="mt-2 text-3xl font-black tracking-tight text-teal-300">{selectedWeek.summary.carbs}g</p>
                                        </div>
                                        <div className="rounded-2xl border border-rose-700/30 bg-rose-950/20 px-4 py-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300/70">Avg Insulin</p>
                                            <p className="mt-2 text-3xl font-black tracking-tight text-rose-300">{selectedWeek.summary.insulin}u</p>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-[28px] border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-3 md:p-5">
                                    <div className="rounded-[20px] border border-slate-800/80 bg-slate-950/60 p-2 md:p-4">
                                        <GlucoseGraph
                                            data={selectedWeek.points}
                                            title=""
                                            height={320}
                                            minimal={true}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-slate-800 bg-slate-900/60 p-4 md:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                            Weekly Insights
                                        </h3>
                                        <button
                                            onClick={handleAnalyzeWeek}
                                            disabled={analyzingWeek}
                                            className="ai-insight-btn sm:w-auto"
                                        >
                                            {analyzingWeek ? "Generating AI Insight..." : "Generate AI Insight"}
                                        </button>
                                    </div>
                                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                        AI reads glucose variability, carb and insulin balance, and timing patterns for this week.
                                    </p>
                                    {weekAnalysis && (
                                        <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-teal-500/20 bg-slate-900 p-4">
                                            <div className="mb-3 flex items-center justify-end">
                                                <SpeakButton text={weekAnalysis} className="mr-2" />
                                                <button
                                                    onClick={() => setWeekAnalysis(null)}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                                                    aria-label="Close insight"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                                                {weekAnalysis}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ), document.body)}
        </div>
    );
}
