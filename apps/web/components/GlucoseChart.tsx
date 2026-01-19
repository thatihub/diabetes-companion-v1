"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { api } from "../lib/api";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
};

type Range = "24h" | "3d" | "7d" | "14d" | "30d" | "90d";

export default function GlucoseChart({ refreshTrigger }: { refreshTrigger?: number }) {
    const [data, setData] = useState<GlucosePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<Range>("24h");

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
        const fetchData = async () => {
            setLoading(true);
            try {
                const hours = getHours(range);
                // Fetch all points within the time range
                const points = await api.get<GlucosePoint[]>(`/api/glucose?hours=${hours}&limit=1000`);

                const sorted = points.reverse().map(p => ({
                    ...p,
                    // Format date differently based on range
                    time: range === "24h"
                        ? new Date(p.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(p.measured_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                    timestamp: new Date(p.measured_at).getTime()
                }));
                setData(sorted);
            } catch (err) {
                console.error("Failed to load chart data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, range]);

    // Helper for loading state per-range? No, generic is fine.

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

            {loading && data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">Loading Chart...</div>
            ) : data.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs bg-zinc-900/50 rounded-lg">
                    Not enough data for this range
                </div>
            ) : (
                <div className="h-48 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                hide={false}
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[40, 300]}
                                allowDataOverflow={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                            <ReferenceLine y={180} stroke="#f97316" strokeDasharray="3 3" />

                            <Area
                                type="monotone"
                                dataKey="glucose_mgdl"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorGlucose)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
