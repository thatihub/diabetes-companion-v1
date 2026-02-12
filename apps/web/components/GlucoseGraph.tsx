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
        <div className="w-full bg-[#0d0d0f] border border-zinc-900 rounded-[32px] p-3 md:p-6 shadow-2xl mb-6 md:mb-10 overflow-hidden">
            {/* Header Area */}
            {(title || summary) && (
                <div className="flex items-center justify-between gap-4 mb-6 px-1 md:px-2">
                    <div className="flex-1">
                        {title && (
                            <h3 className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.2em] line-clamp-1">{title}</h3>
                        )}
                    </div>
                    {summary && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest leading-none mb-1">Carbs</span>
                                <span className="text-sm md:text-base font-black text-emerald-400 leading-none">{summary.carbs}g</span>
                            </div>
                            <div className="w-px h-6 bg-zinc-800 opacity-50"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest leading-none mb-1">Insulin</span>
                                <span className="text-sm md:text-base font-black text-rose-400 leading-none">{summary.insulin}u</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full -ml-4 md:ml-0" style={{ height }}>
                <ResponsiveContainer width="110%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />

                        <XAxis
                            dataKey="time"
                            stroke="#3f3f46"
                            fontSize={9}
                            fontWeight={700}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 70}
                            tick={{ fill: '#52525b' }}
                        />

                        <YAxis
                            yAxisId="glucose"
                            hide={false}
                            stroke="#3f3f46"
                            fontSize={9}
                            fontWeight={700}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            padding={{ top: 40, bottom: 20 }}
                            tick={{ fill: '#52525b' }}
                        />

                        {/* Hidden Proxy Axis for Scaling */}
                        <YAxis yAxisId="carbs" orientation="right" hide={true} domain={[0, 200]} />
                        <YAxis yAxisId="insulin" orientation="right" hide={true} domain={[0, 30]} />

                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-zinc-800/50 min-w-[160px]">
                                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] border-b border-zinc-900 pb-3 mb-3">{label}</p>
                                            <div className="space-y-3">
                                                {payload.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.name}</span>
                                                        <span className="text-sm font-black" style={{ color: p.color }}>
                                                            {p.value}{String(p.name || '').includes('Glucose') ? ' mg/dL' : String(p.name || '').includes('Carbs') ? 'g' : 'u'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <ReferenceLine yAxisId="glucose" y={70} stroke="#ef4444" strokeDasharray="5 5" opacity={0.3} />
                        <ReferenceLine yAxisId="glucose" y={180} stroke="#f97316" strokeDasharray="5 5" opacity={0.3} />

                        <Area
                            yAxisId="glucose"
                            type="monotone"
                            dataKey="glucose_mgdl"
                            name="Glucose"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGlucose)"
                            animationDuration={1500}
                            activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
                        />

                        <Bar
                            yAxisId="carbs"
                            dataKey="carbs_grams"
                            name="Carbs"
                            fill="#10b981"
                            barSize={typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 16}
                            radius={[4, 4, 0, 0]}
                            fillOpacity={0.8}
                        />

                        <Bar
                            yAxisId="insulin"
                            dataKey="insulin_units"
                            name="Insulin"
                            fill="#f43f5e"
                            barSize={typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8}
                            radius={[12, 12, 0, 0]}
                            stroke="#fda4af"
                            strokeWidth={1}
                            fillOpacity={0.9}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
