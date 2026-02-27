"use client";

import { useEffect, useState } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import { api } from "../lib/api";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
};

type Range = "24h" | "3d" | "7d" | "14d" | "30d" | "90d";

export default function GlucoseChart({ refreshTrigger, initialRange = "24h" }: { refreshTrigger?: number, initialRange?: Range }) {
    const [data, setData] = useState<GlucosePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<Range>(initialRange);
    const [isMounted, setIsMounted] = useState(false);

    const getHours = (r: Range) => {
        switch (r) {
            case "24h": return 24;
            case "3d": return 24 * 3;
            case "7d": return 24 * 7;
            case "14d": return 24 * 14;
            case "30d": return 24 * 30;
            case "90d": return 24 * 90;
            default: return 24;
        }
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const hours = getHours(range);
                const points = await api.get<GlucosePoint[]>(`/api/glucose?hours=${hours}&limit=10000`);

                const sorted = points
                    .filter(p => p.measured_at && !isNaN(new Date(p.measured_at).getTime()))
                    .reverse()
                    .map(p => ({
                        ...p,
                        insulin_units: p.insulin_units !== null && p.insulin_units !== undefined ? Number(p.insulin_units) : undefined,
                        carbs_grams: p.carbs_grams !== null && p.carbs_grams !== undefined ? Number(p.carbs_grams) : undefined,
                        time: range === "24h"
                            ? new Date(p.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(p.measured_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                        fullTime: new Date(p.measured_at).toLocaleString()
                    }));
                setData(sorted);
            } catch (err) {
                console.error("Failed to load chart data", err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, range]);

    const ranges: Range[] = ["24h", "3d", "7d", "14d", "30d", "90d"];

    return (
        <div className="wellness-card mb-2 p-5 md:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-slate-100 text-lg font-bold tracking-tight">Clarity View</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Continuous Trends</p>
                </div>
                <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 w-fit overflow-x-auto no-scrollbar">
                    {ranges.map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-wider whitespace-nowrap
                                ${range === r ? 'bg-slate-700 text-teal-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {!isMounted || (loading && data.length === 0) ? (
                <div className="h-[18rem] md:h-[22rem] flex flex-col items-center justify-center text-slate-600 gap-3">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold tracking-widest uppercase">Analyzing Data...</span>
                </div>
            ) : error ? (
                <div className="h-[18rem] md:h-[22rem] flex flex-col items-center justify-center gap-4 bg-rose-500/5 rounded-3xl border border-rose-500/10">
                    <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">⚠️ Sync Failed</p>
                    <button
                        onClick={() => setRange(range)}
                        className="px-6 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-100 text-[10px] font-bold uppercase tracking-widest rounded-full border border-rose-500/20 transition-all"
                    >
                        Retry Sync
                    </button>
                </div>
            ) : data.length < 2 ? (
                <div className="h-[18rem] md:h-[22rem] flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase tracking-widest bg-slate-900/20 rounded-3xl">
                    Awaiting more readings...
                </div>
            ) : (
                <div className="h-[18rem] md:h-[22rem] w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGlucoseRedesign" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94d2bd" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#94d2bd" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} strokeOpacity={0.2} />

                            <XAxis
                                dataKey="time"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                                fontStyle="bold"
                            />

                            <YAxis
                                yAxisId="glucose"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[40, 400]}
                                tickCount={8}
                                fontStyle="bold"
                            />

                            <YAxis yAxisId="carbs" orientation="right" hide domain={[0, 200]} />
                            <YAxis yAxisId="insulin" orientation="right" hide domain={[0, 30]} />

                            {/* Clarity Range Bands */}
                            <ReferenceArea yAxisId="glucose" y1={70} y2={180} fill="#94d2bd" fillOpacity={0.03} />
                            <ReferenceArea yAxisId="glucose" y1={0} y2={70} fill="#ae2012" fillOpacity={0.05} />
                            <ReferenceArea yAxisId="glucose" y1={180} y2={400} fill="#ee9b00" fillOpacity={0.05} />

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{d.fullTime}</p>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xl font-bold flex items-baseline gap-1">
                                                        {d.glucose_mgdl}
                                                        <span className="text-[10px] font-medium text-slate-500">mg/dL</span>
                                                    </p>
                                                    {d.carbs_grams && <p className="text-[10px] font-bold text-emerald-400 capitalize">🍴 {d.carbs_grams}g Carbs</p>}
                                                    {d.insulin_units && <p className="text-[10px] font-bold text-rose-400 capitalize">💉 {d.insulin_units}u Insulin</p>}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            {/* Range Indicators */}
                            <ReferenceArea yAxisId="glucose" y1={70} y2={70.5} fill="#94d2bd" fillOpacity={0.3} />
                            <ReferenceArea yAxisId="glucose" y1={180} y2={180.5} fill="#ee9b00" fillOpacity={0.3} />

                            <Area
                                yAxisId="glucose"
                                type="monotone"
                                dataKey="glucose_mgdl"
                                stroke="#94d2bd"
                                strokeWidth={3}
                                fill="url(#colorGlucoseRedesign)"
                                animationDuration={1500}
                                isAnimationActive={true}
                                dot={false}
                                activeDot={{ r: 6, fill: '#f8fafc', stroke: '#94d2bd', strokeWidth: 2 }}
                            />

                            <Bar yAxisId="carbs" dataKey="carbs_grams" fill="#10b981" barSize={12} radius={[5, 5, 0, 0]} opacity={0.75} />
                            <Bar yAxisId="insulin" dataKey="insulin_units" fill="#f43f5e" barSize={20} radius={[6, 6, 0, 0]} opacity={0.88} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
