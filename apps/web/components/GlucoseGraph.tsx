"use client";
import { useState } from "react";
import { Area, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import SpeakButton from "./SpeakButton";

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
    minimal?: boolean;
};

export default function GlucoseGraph({ data, height = 200, title, summary, minimal = false }: GlucoseGraphProps) {
    const isMounted = typeof window !== "undefined";
    const [showMetrics, setShowMetrics] = useState(false);

    if (!isMounted || !data || data.length === 0) {
        return (
            <div className={`${minimal ? '' : 'wellness-card mx-6'} p-10 mb-8 flex flex-col items-center justify-center text-slate-600 border-dashed border-slate-800`} style={{ height: height + 100 }}>
                <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Stream...</p>
            </div>
        );
    }

    const cardClass = minimal
        ? "w-full overflow-visible"
        : "wellness-card mx-6 p-8 mb-10 overflow-visible";

    return (
        <div className={cardClass}>
            {/* Header Area */}
            {(title || summary) && (
                <div className={`flex items-end justify-between gap-4 ${minimal ? 'mb-8' : 'mb-10'}`}>
                    <div className="flex-1">
                        {title && (
                            <h3 className="text-slate-100 text-xl font-black tracking-tighter">{title.split(' (')[0]}</h3>
                        )}
                        {title?.includes('(') && (
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                                {title.split(' (')[1].replace(')', '')}
                            </p>
                        )}
                    </div>
                    {summary && (
                        <div className="flex items-center gap-4 bg-slate-800/20 px-6 py-3 rounded-[24px] border border-slate-700/30 relative">
                            <div className="text-right">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Avg Carbs / Day</span>
                                <span className="text-sm font-black text-teal-400">{summary.carbs}g</span>
                            </div>
                            <div className="w-px h-6 bg-slate-700"></div>
                            <div className="text-right">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Avg Insulin / Day</span>
                                <span className="text-sm font-black text-rose-400">{summary.insulin}u</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowMetrics((v) => !v); }}
                                className="ml-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                            >
                                Metrics
                            </button>
                            {showMetrics && (
                                <div
                                    className="absolute left-0 right-auto sm:left-auto sm:right-0 top-[calc(100%+8px)] z-20 w-72 max-w-[90vw] max-h-72 overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-950/95 p-4 shadow-2xl scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-start justify-between sticky top-0 bg-slate-950/95 pb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Range Snapshot</p>
                                        <div className="flex items-center gap-2">
                                            <SpeakButton
                                                text="Time in range 74 percent. Average glucose 142 milligrams per deciliter. G M I 6.7 percent. Variability 31 percent. Average carbs per day 210 grams. Average insulin per day 38 units, basal 18, bolus 20. Events: lows 2, highs 6. Corrections: average 3.1 units, max 10 units."
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setShowMetrics(false); }}
                                                className="text-slate-500 hover:text-white"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-200 pr-1">
                                        <p><span className="font-bold text-teal-300">Time in Range:</span> 74% (7d)</p>
                                        <p><span className="font-bold text-slate-200">Avg Glucose / GMI:</span> 142 mg/dL · 6.7%</p>
                                        <p><span className="font-bold text-slate-200">Variability (%CV):</span> 31%</p>
                                        <p><span className="font-bold text-teal-300">Avg Carbs / Day:</span> 210 g</p>
                                        <p><span className="font-bold text-rose-300">Avg Insulin / Day:</span> 38 u (Basal 18 / Bolus 20)</p>
                                        <p><span className="font-bold text-amber-300">Events (7d):</span> Lows: 2 · Highs: 6</p>
                                        <p><span className="font-bold text-rose-300">Corrections (7d):</span> Avg 3.1 u · Max 10 u</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full -ml-4" style={{ height }}>
                <ResponsiveContainer width="105%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGlucoseGallery" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94d2bd" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#94d2bd" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#475569" vertical={false} strokeOpacity={0.05} />

                        <XAxis
                            dataKey="time"
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={80}
                            fontStyle="bold"
                            tick={{ fill: "#64748b" }}
                        />

                        <YAxis
                            yAxisId="glucose"
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            domain={[40, 400]}
                            tickCount={5}
                            fontStyle="bold"
                            tick={{ fill: "#64748b" }}
                        />

                        <YAxis yAxisId="carbs" hide domain={[0, 200]} />
                        <YAxis yAxisId="insulin" hide domain={[0, 30]} />

                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    const hasCarbs = d.carbs_grams && d.carbs_grams > 0;
                                    const hasInsulin = d.insulin_units && d.insulin_units > 0;

                                    return (
                                        <div className="bg-slate-900/95 border border-white/10 p-5 rounded-[28px] shadow-2xl backdrop-blur-3xl min-w-[200px]">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-3">{label}</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Metabolic State</p>
                                                    <p className="text-3xl font-black text-slate-100 flex items-baseline gap-1">
                                                        {d.glucose_mgdl}
                                                        <span className="text-sm font-bold text-teal-400">mg/dL</span>
                                                    </p>
                                                </div>
                                                {(hasCarbs || hasInsulin) && (
                                                    <div className="flex gap-4 pt-2 border-t border-white/5">
                                                        {hasCarbs && (
                                                            <div className="bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20">
                                                                <span className="text-[10px] font-black text-teal-400">🍴 {d.carbs_grams}g</span>
                                                            </div>
                                                        )}
                                                        {hasInsulin && (
                                                            <div className="bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                                                                <span className="text-[10px] font-black text-rose-400">💉 {d.insulin_units}u</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <ReferenceArea yAxisId="glucose" y1={70} y2={180} fill="#94d2bd" fillOpacity={0.05} />
                        <ReferenceArea yAxisId="glucose" y1={180} y2={400} fill="#ee9b00" fillOpacity={0.03} />
                        <ReferenceArea yAxisId="glucose" y1={0} y2={70} fill="#ae2012" fillOpacity={0.03} />

                        <Area
                            yAxisId="glucose"
                            type="monotone"
                            dataKey="glucose_mgdl"
                            stroke="#94d2bd"
                            strokeWidth={2.5}
                            fill="url(#colorGlucoseGallery)"
                            animationDuration={2000}
                            activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 3, fill: '#14b8a6' }}
                        />

                        <Bar yAxisId="carbs" dataKey="carbs_grams" fill="#38bdf8" barSize={12} radius={[5, 5, 0, 0]} opacity={0.9} />
                        <Bar yAxisId="insulin" dataKey="insulin_units" fill="#f43f5e" barSize={20} radius={[6, 6, 0, 0]} opacity={0.8} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
