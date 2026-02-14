"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import GlucoseGraph from "./GlucoseGraph";

type Range = "7d" | "14d" | "30d" | "90d";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
    time?: string;
    timestamp?: number;
};

export default function TrendsSplitView() {
    const [range, setRange] = useState<Range>("7d");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<{ title: string, points: GlucosePoint[], summary?: { carbs: number, insulin: number } }[]>([]);
    const [stats, setStats] = useState({ avg: 0, gmi: 0, totalCarbs: 0, totalInsulin: 0 });
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<{ title: string, points: GlucosePoint[], summary?: { carbs: number, insulin: number } } | null>(null);
    const [weekAnalysis, setWeekAnalysis] = useState<string | null>(null);
    const [analyzingWeek, setAnalyzingWeek] = useState(false);

    // Reset week analysis when switching weeks
    useEffect(() => {
        setWeekAnalysis(null);
    }, [selectedWeek]);

    const ranges: Range[] = ["7d", "14d", "30d", "90d"];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysis(null);
        try {
            const res = await api.post<{ analysis: string }>("/api/insights/analyze", { range });
            setAnalysis(res.analysis);
        } catch (e: any) {
            setAnalysis(`Failed to generate insights: ${e.message || 'Unknown error'}`);
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
        } catch (e: any) {
            setWeekAnalysis(`Failed to generate weekly insights: ${e.message || 'Unknown error'}`);
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
                const rawPoints = await api.get<GlucosePoint[]>(`/api/glucose?hours=${totalHours}&limit=50000`);

                // Calculate Stats
                if (rawPoints.length > 0) {
                    const sum = rawPoints.reduce((acc, p) => acc + p.glucose_mgdl, 0);
                    const avg = sum / rawPoints.length;
                    const gmi = 3.31 + (0.02392 * avg);

                    const totalCarbs = rawPoints.reduce((acc, p) => acc + (Number(p.carbs_grams) || 0), 0);
                    const totalInsulin = rawPoints.reduce((acc, p) => acc + (Number(p.insulin_units) || 0), 0);

                    // Daily Averages
                    const daysInPeriod = totalHours / 24;
                    const avgDailyCarbs = totalCarbs / daysInPeriod;
                    const avgDailyInsulin = totalInsulin / daysInPeriod;

                    setStats({
                        avg: Math.round(avg),
                        gmi: Number(gmi.toFixed(1)),
                        totalCarbs: Number(avgDailyCarbs.toFixed(1)),
                        totalInsulin: Number(avgDailyInsulin.toFixed(1))
                    });
                } else {
                    setStats({ avg: 0, gmi: 0, totalCarbs: 0, totalInsulin: 0 });
                }

                // Optimized Processing: One-pass grouping (O(N))
                const processingNow = rawPoints.length > 0
                    ? new Date(rawPoints[0].measured_at) // Use latest point as reference point
                    : new Date();

                const nowMs = processingNow.getTime();
                const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
                const chunks: any[] = [];

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
                chunks.forEach(chunk => {
                    if (chunk.raw.length > 0) {
                        const totalCarbs = chunk.raw.reduce((acc: number, p: any) => acc + (Number(p.carbs_grams) || 0), 0);
                        const totalInsulin = chunk.raw.reduce((acc: number, p: any) => acc + (Number(p.insulin_units) || 0), 0);
                        chunk.summary = {
                            carbs: Number((totalCarbs / 7).toFixed(1)),
                            insulin: Number((totalInsulin / 7).toFixed(1))
                        };

                        // Intelligent Sampling for Chart Performance
                        let toProcess = chunk.raw.reverse();
                        const sampleRate = Math.ceil(toProcess.length / 800); // Target ~800 pts per week for smoothness

                        chunk.points = toProcess
                            .filter((_: any, idx: number) => idx % sampleRate === 0)
                            .map((p: any) => ({
                                ...p,
                                insulin_units: p.insulin_units ? Number(p.insulin_units) : undefined,
                                carbs_grams: p.carbs_grams ? Number(p.carbs_grams) : undefined,
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
                setStats({ avg: 0, gmi: 0, totalCarbs: 0, totalInsulin: 0 });
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
                        className="group relative w-full flex items-center justify-center gap-4 px-10 py-6 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-teal-500 hover:text-slate-950 transition-all duration-300 disabled:opacity-50 overflow-hidden active:scale-95 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {analyzing ? (
                            <>
                                <span className="animate-spin text-xl">✨</span> Computing Metabolic Intelligence...
                            </>
                        ) : (
                            <>
                                <span className="text-xl">✨</span> Generate Pattern Scan
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
                        {analysis}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-6 mb-10">
                <div className="wellness-card p-6">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Average Glucose</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-100">{stats.avg > 0 ? stats.avg : '--'}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">mg/dL</span>
                    </div>
                </div>
                <div className="wellness-card p-6">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">GMI (Est. A1C)</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-100">{stats.gmi > 0 ? stats.gmi : '--'}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">%</span>
                    </div>
                </div>
                <div className="wellness-card p-6">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Daily Carbs</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-teal-400">{stats.totalCarbs > 0 ? stats.totalCarbs : '--'}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">g/day</span>
                    </div>
                </div>
                <div className="wellness-card p-6">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Daily Insulin</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-rose-400">{stats.totalInsulin > 0 ? stats.totalInsulin : '--'}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">u/day</span>
                    </div>
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

            {/* Enlarged Modal Popup (Diagnostic View) */}
            {selectedWeek && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-500">
                    <div
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-[60px]"
                        onClick={() => setSelectedWeek(null)}
                    ></div>

                    <div className="relative w-full max-w-5xl bg-slate-900 border-t md:border border-white/5 rounded-t-[48px] md:rounded-[56px] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden h-[96vh] md:h-[85vh] flex flex-col animate-in slide-in-from-bottom-20 duration-700">
                        {/* Pull bar for mobile */}
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-10 md:hidden opacity-50 flex-shrink-0"></div>

                        {/* Modal Header: Deep Insight Page Title */}
                        <div className="flex flex-col gap-10 mb-12 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tighter">
                                        {selectedWeek.title.split(' (')[0]}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                                        <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.4em]">
                                            {selectedWeek.title.split(' (')[1]?.replace(')', '')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        console.log("Close modal clicked");
                                        setSelectedWeek(null);
                                    }}
                                    className="relative z-50 w-14 h-14 flex items-center justify-center bg-slate-800/40 rounded-full text-slate-500 hover:text-white transition-all border border-white/5 hover:scale-110 active:scale-90"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>

                        {/* Diagnostic Action Bar - Stacked Layout */}
                        <div className="flex flex-col gap-6 flex-shrink-0">
                            <button
                                onClick={() => {
                                    console.log("Analyze week clicked");
                                    handleAnalyzeWeek();
                                }}
                                disabled={analyzingWeek}
                                className="group relative w-full flex items-center justify-center gap-3 px-6 py-5 bg-teal-500 text-slate-950 text-[10px] font-bold uppercase tracking-[0.1em] rounded-[24px] hover:shadow-[0_0_50px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50 overflow-hidden active:scale-95 min-h-[60px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {analyzingWeek ? (
                                        <><span className="animate-spin text-lg">✨</span> Analyzing Patterns...</>
                                    ) : (
                                        <><span className="text-lg">✨</span> Generate Week Diagnosis</>
                                    )}
                                </span>
                            </button>

                            {selectedWeek.summary && (
                                <div className="flex-1 flex items-center justify-around gap-4 px-10 py-7 bg-slate-800/60 rounded-[32px] border border-white/10 backdrop-blur-xl min-h-[84px] shadow-inner">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.25em] block mb-2">Avg Carbs</span>
                                        <span className="text-3xl font-black text-teal-400 tracking-tighter">{selectedWeek.summary.carbs}g</span>
                                    </div>
                                    <div className="w-px h-12 bg-white/5"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.25em] block mb-2">Avg Insulin</span>
                                        <span className="text-3xl font-black text-rose-400 tracking-tighter">{selectedWeek.summary.insulin}u</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chart Area - Scrollable Container */}
                        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-1 pb-16 mt-8 overscroll-contain">
                            <div className="bg-slate-800/20 rounded-[40px] p-4 md:p-8 border border-white/5 overflow-hidden min-h-[400px]">
                                <GlucoseGraph
                                    data={selectedWeek.points}
                                    title=""
                                    height={400}
                                    minimal={true}
                                />
                            </div>

                            {weekAnalysis && (
                                <div className="mt-12 group relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative wellness-card p-10 md:p-12 border-white/10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.5)]">
                                                <span className="text-2xl font-black">AI</span>
                                            </div>
                                            <div>
                                                <h4 className="text-slate-100 text-lg font-black tracking-tight">Intelligence Scan</h4>
                                                <p className="text-teal-400 text-[9px] font-black uppercase tracking-[0.3em]">Full Pattern Diagnosis Complete</p>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                            {weekAnalysis}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 p-10 bg-slate-800/10 rounded-[40px] border border-white/5 opacity-60">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Diagnostic Context</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                    This visualization synthesizes high-resolution biometric telemetry. Teal gradients map to target stability; vertical pillars denote exogenous insulin boluses and glycemic loading events.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
