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
        } catch (e) {
            setAnalysis("Failed to generate insights.");
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
        } catch (e) {
            setWeekAnalysis("Failed to generate weekly insights.");
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

                // Process Data: Split into 7-day chunks
                const now = new Date();
                const chunks = [];
                const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

                // Calculate number of weeks needed
                const weeks = Math.ceil(totalHours / (24 * 7));

                for (let i = 0; i < weeks; i++) {
                    const chunkEnd = new Date(now.getTime() - (i * oneWeekMs));
                    const chunkStart = new Date(now.getTime() - ((i + 1) * oneWeekMs)); // inclusive of end, exclusive of start logic basically

                    // Filter points for this week
                    const chunkPoints = rawPoints.filter(p => {
                        const t = new Date(p.measured_at).getTime();
                        return t > chunkStart.getTime() && t <= chunkEnd.getTime();
                    });

                    if (chunkPoints.length > 0) {
                        // Format for Graph
                        const formatted = chunkPoints.reverse().map(p => ({
                            ...p,
                            insulin_units: p.insulin_units ? Number(p.insulin_units) : undefined,
                            carbs_grams: p.carbs_grams ? Number(p.carbs_grams) : undefined,
                            time: new Date(p.measured_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                            timestamp: new Date(p.measured_at).getTime()
                        }));

                        // Weekly Daily Averages
                        const weekCarbs = chunkPoints.reduce((acc, p) => acc + (Number(p.carbs_grams) || 0), 0);
                        const weekInsulin = chunkPoints.reduce((acc, p) => acc + (Number(p.insulin_units) || 0), 0);

                        chunks.push({
                            title: `Week ${i + 1} (${chunkStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${chunkEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })})`,
                            points: formatted,
                            summary: {
                                carbs: Number((weekCarbs / 7).toFixed(1)),
                                insulin: Number((weekInsulin / 7).toFixed(1))
                            }
                        });
                    }
                }

                setWeeklyData(chunks);

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
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-sm">Select Period:</span>
                    <div className="flex gap-2">
                        {ranges.map(r => (
                            <button
                                key={r}
                                onClick={() => { setRange(r); setAnalysis(null); }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                    ${range === r ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {analyzing ? (
                        <>
                            <span className="animate-spin text-lg">✨</span> Analyzing...
                        </>
                    ) : (
                        <>
                            <span className="text-lg">✨</span> Analyze Trends with AI
                        </>
                    )}
                </button>
            </div>

            {/* AI Analysis Result */}
            {analysis && (
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <h3 className="text-indigo-200 font-bold mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span> AI Trend Analysis ({range})
                        </div>
                        <button
                            onClick={() => setAnalysis(null)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <span className="text-lg">×</span>
                        </button>
                    </h3>
                    <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                        {analysis}
                    </div>
                    <button
                        onClick={() => setAnalysis(null)}
                        className="text-[10px] text-white/40 hover:text-white/70 uppercase tracking-widest font-bold w-full text-center py-2 border-t border-white/5"
                    >
                        Dismiss Analysis
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-8">
                <div className="bg-zinc-900/50 p-3 md:p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-[10px] md:text-sm text-zinc-400 uppercase tracking-wider font-bold mb-1">Avg Glucose</h3>
                    <p className="text-xl md:text-2xl font-black text-white">{stats.avg > 0 ? stats.avg : '--'} <span className="text-[10px] text-zinc-500 font-normal">mg/dL</span></p>
                </div>
                <div className="bg-zinc-900/50 p-3 md:p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-[10px] md:text-sm text-zinc-400 uppercase tracking-wider font-bold mb-1">GMI (Est. A1C)</h3>
                    <p className="text-xl md:text-2xl font-black text-white">{stats.gmi > 0 ? stats.gmi : '--'} <span className="text-[10px] text-zinc-500 font-normal">%</span></p>
                </div>
                <div className="bg-zinc-900/50 p-3 md:p-4 rounded-xl border border-zinc-800 border-t-emerald-500/30">
                    <h3 className="text-[10px] md:text-sm text-zinc-400 uppercase tracking-wider font-bold mb-1">Avg Carbs</h3>
                    <p className="text-xl md:text-2xl font-black text-emerald-400">{stats.totalCarbs > 0 ? stats.totalCarbs : '--'} <span className="text-[10px] text-zinc-500 font-normal">g/day</span></p>
                </div>
                <div className="bg-zinc-900/50 p-3 md:p-4 rounded-xl border border-zinc-800 border-t-rose-500/30">
                    <h3 className="text-[10px] md:text-sm text-zinc-400 uppercase tracking-wider font-bold mb-1">Avg Insulin</h3>
                    <p className="text-xl md:text-2xl font-black text-rose-400">{stats.totalInsulin > 0 ? stats.totalInsulin : '--'} <span className="text-[10px] text-zinc-500 font-normal">u/day</span></p>
                </div>
            </div>

            {/* Graphs List */}
            {
                loading ? (
                    <div className="text-center text-zinc-500 py-10 font-bold uppercase tracking-widest text-[10px]">Loading Trends...</div>
                ) : error ? (
                    <div className="text-center py-10 px-4">
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-auto">
                            <p className="text-yellow-400 text-sm mb-4">⚠️ {error}</p>
                            <button
                                onClick={() => setRange(range)}
                                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : weeklyData.length === 0 ? (
                    <div className="text-center text-zinc-500 py-10 font-bold uppercase tracking-widest text-[10px]">No data found.</div>
                ) : (
                    <div className="space-y-6">
                        {weeklyData.map((week, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedWeek(week)}
                                className="cursor-pointer hover:scale-[1.01] transition-transform active:scale-95"
                            >
                                <GlucoseGraph
                                    data={week.points}
                                    title={week.title}
                                    summary={week.summary}
                                    height={200}
                                />
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Enlarged Modal Popup */}
            {selectedWeek && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        onClick={() => setSelectedWeek(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-5xl bg-[#09090b] border-t md:border border-zinc-800 rounded-t-[32px] md:rounded-[40px] p-6 md:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] md:max-h-[95vh] flex flex-col animate-in slide-in-from-bottom-10 duration-500">

                        {/* Pull bar for mobile */}
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 md:hidden"></div>

                        {/* Modal Header */}
                        <div className="flex flex-col gap-6 mb-8 border-b border-zinc-800 pb-8 relative">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">
                                        {selectedWeek.title.split(' (')[0]}
                                    </h2>
                                    <span className="block text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                        {selectedWeek.title.split(' (')[1]?.replace(')', '')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedWeek(null)}
                                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all md:relative md:top-0 md:right-0"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <button
                                    onClick={handleAnalyzeWeek}
                                    disabled={analyzingWeek}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {analyzingWeek ? (
                                        <>
                                            <span className="animate-spin text-lg">✨</span> Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl">✨</span> AI Pattern Analysis
                                        </>
                                    )}
                                </button>

                                {selectedWeek.summary && (
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="flex-1 md:flex-none md:min-w-[120px] bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 block mb-1">Avg Carbs</span>
                                            <span className="text-xl font-black text-emerald-400">{selectedWeek.summary.carbs}g</span>
                                        </div>
                                        <div className="flex-1 md:flex-none md:min-w-[120px] bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl text-center">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-rose-500/60 block mb-1">Avg Insulin</span>
                                            <span className="text-xl font-black text-rose-400">{selectedWeek.summary.insulin}u</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-1">
                            {/* Larger Graph with responsiveness */}
                            <div className="bg-zinc-950/50 rounded-3xl border border-zinc-900 overflow-hidden">
                                <GlucoseGraph
                                    data={selectedWeek.points}
                                    title=""
                                    height={typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 450}
                                />
                            </div>

                            {weekAnalysis && (
                                <div className="mt-8 bg-zinc-900/30 border border-indigo-500/20 p-6 md:p-10 rounded-[32px] relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 shadow-[0_0_20px_#4f46e5]"></div>
                                    <h4 className="text-indigo-200 text-xl font-black mb-6 flex items-center gap-3">
                                        <span className="text-3xl">🤖</span> AI Diagnosis
                                    </h4>
                                    <div className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                        {weekAnalysis}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 p-6 bg-zinc-900/20 rounded-[28px] border border-zinc-800/50">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Clinical Reference</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                    This visualization incorporates high-density biometric data (15-min intervals).
                                    Blue clusters denote target stability; emerald spikes represent glycemic load and rose pillars denote pharmaco-corrections.
                                </p>
                            </div>

                            {/* Bottom spacing for mobile */}
                            <div className="h-20 md:hidden"></div>
                        </div>

                        {/* Modal Footer (Sticky if needed, or buttom of list) */}
                        <div className="mt-auto pt-6 border-t border-zinc-900 flex justify-center pb-8 md:pb-0">
                            <button
                                onClick={() => setSelectedWeek(null)}
                                className="w-full md:w-auto px-16 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-2xl"
                            >
                                Close Detailed View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
