"use client";

import { useEffect, useState } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
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
                    .filter(p => p.measured_at && !isNaN(new Date(p.measured_at).getTime())) // Filter invalid dates
                    .reverse()
                    .map(p => ({
                        ...p,
                        insulin_units: p.insulin_units ? Number(p.insulin_units) : undefined,
                        carbs_grams: p.carbs_grams ? Number(p.carbs_grams) : undefined,
                        time: range === "24h"
                            ? new Date(p.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(p.measured_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                        timestamp: new Date(p.measured_at).getTime()
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
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Trend</h3>
                <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                    {ranges.map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors whitespace-nowrap
                                ${range === r ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {!isMounted ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">Loading Chart...</div>
            ) : loading && data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">Loading Chart...</div>
            ) : error ? (
                <div className="h-48 flex flex-col items-center justify-center gap-2 bg-yellow-900/10 rounded-lg">
                    <p className="text-yellow-400 text-xs">⚠️ {error}</p>
                    <button
                        onClick={() => setRange(range)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : data.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs bg-zinc-900/50 rounded-lg">
                    Not enough data for this range
                </div>
            ) : (
                <div className="h-48 w-full -ml-4">
                    <ComposedChart data={data} width={350} height={192}>
                        <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                        {/* Time Axis */}
                        <XAxis
                            dataKey="time"
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />

                        {/* Glucose Axis (Left) */}
                        <YAxis
                            yAxisId="glucose"
                            hide={false}
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            allowDataOverflow={false}
                        />

                        {/* Carbs Axis: scaled 0-200g so normal meals (50g) are ~25% height */}
                        <YAxis
                            yAxisId="carbs"
                            orientation="right"
                            hide={true}
                            domain={[0, 200]}
                        />

                        {/* Insulin Axis: scaled 0-30u so normal doses (5u) are ~16% height */}
                        <YAxis
                            yAxisId="insulin"
                            orientation="right"
                            hide={true}
                            domain={[0, 30]}
                        />

                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />

                        <ReferenceLine yAxisId="glucose" y={70} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine yAxisId="glucose" y={180} stroke="#f97316" strokeDasharray="3 3" />

                        {/* Main Glucose Trend */}
                        <Area
                            yAxisId="glucose"
                            type="monotone"
                            dataKey="glucose_mgdl"
                            name="Glucose"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGlucose)"
                        />

                        {/* Carbs Bar (Orange) */}
                        <Bar
                            yAxisId="carbs"
                            dataKey="carbs_grams"
                            name="Carbs (g)"
                            fill="#fb923c"
                            barSize={6}
                            radius={[3, 3, 0, 0]}
                            fillOpacity={0.9}
                        />

                        <Bar
                            yAxisId="insulin"
                            dataKey="insulin_units"
                            name="Insulin (u)"
                            fill="#a855f7"
                            barSize={6}
                            radius={[3, 3, 0, 0]}
                            fillOpacity={0.9}
                        />

                    </ComposedChart>
                </div>
            )}
        </div>
    );
}
