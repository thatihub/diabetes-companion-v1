"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { api } from "../lib/api";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
};

export default function GlucoseChart({ refreshTrigger }: { refreshTrigger?: number }) {
    const [data, setData] = useState<GlucosePoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch last 24h or roughly last 20 points
                const points = await api.get<GlucosePoint[]>("/api/glucose?limit=24");
                // Sort by time ascending for the chart
                const sorted = points.reverse().map(p => ({
                    ...p,
                    time: new Date(p.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    // create numeric timestamp for potential future scaling
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
    }, [refreshTrigger]);

    if (loading) return <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">Loading Chart...</div>;
    if (data.length < 2) return null; // Need at least 2 points to make a line

    return (
        <div className="w-full max-w-sm h-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6">
            <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Trend (Last 24h)</h3>
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
        </div>
    );
}
