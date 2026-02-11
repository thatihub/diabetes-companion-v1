"use client";

import { useState, useEffect } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
    time?: string;
    timestamp?: number;
};

type GlucoseGraphProps = {
    data: GlucosePoint[];
    height?: number;
    title?: string;
    summary?: { carbs: number; insulin: number };
};

export default function GlucoseGraph({ data, height = 200, title, summary }: GlucoseGraphProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6 flex items-center justify-center text-zinc-600 text-xs`} style={{ height: height + 80 }}>
                {title && <h3 className="absolute top-4 left-4 text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>}
                Loading chart...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6 flex items-center justify-center text-zinc-600 text-xs`} style={{ height: height + 80 }}>
                {title && <h3 className="absolute top-4 left-4 text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>}
                No data available
            </div>
        );
    }

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl mb-8 overflow-hidden">
            {/* Header Area */}
            {(title || summary) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8 px-1">
                    <div className="space-y-1">
                        {title && (
                            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
                        )}
                    </div>
                    {summary && (
                        <div className="flex gap-2">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-orange-500/80 uppercase tracking-tighter">Daily Avg Carbs</span>
                                <span className="text-sm font-bold text-orange-400">{summary.carbs}g</span>
                            </div>
                            <div className="w-px h-8 bg-zinc-800 mx-1"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-purple-500/80 uppercase tracking-tighter">Daily Avg Insulin</span>
                                <span className="text-sm font-bold text-purple-400">{summary.insulin}u</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full -ml-4" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                            minTickGap={80}
                        />

                        <YAxis
                            yAxisId="glucose"
                            hide={false}
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            padding={{ top: 40, bottom: 10 }}
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl space-y-2">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-2">{label}</p>
                                            {payload.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between gap-6">
                                                    <span className="text-xs font-medium text-zinc-400">{p.name}</span>
                                                    <span className="text-xs font-black" style={{ color: p.color }}>
                                                        {p.value}{String(p.name || '').includes('Glucose') ? ' mg/dL' : String(p.name || '').includes('Carbs') ? 'g' : 'u'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <ReferenceLine yAxisId="glucose" y={70} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                        <ReferenceLine yAxisId="glucose" y={180} stroke="#f97316" strokeDasharray="3 3" opacity={0.5} />

                        {/* Glucose Trend - Main Area */}
                        <Area
                            yAxisId="glucose"
                            type="monotone"
                            dataKey="glucose_mgdl"
                            name="Glucose"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorGlucose)"
                            animationDuration={1000}
                        />

                        {/* Carbs - Distinct Orange Bars */}
                        <Bar
                            yAxisId="carbs"
                            dataKey="carbs_grams"
                            name="Carbs"
                            fill="#f97316"
                            barSize={14}
                            radius={[6, 6, 0, 0]}
                            fillOpacity={0.8}
                        />

                        {/* Insulin - Using a Different Style (Thin Bar with Border) to be Distinct */}
                        <Bar
                            yAxisId="insulin"
                            dataKey="insulin_units"
                            name="Insulin"
                            fill="#a855f7"
                            barSize={6}
                            radius={[10, 10, 0, 0]}
                            stroke="#d8b4fe"
                            strokeWidth={1}
                            fillOpacity={0.9}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div >
    );
}
