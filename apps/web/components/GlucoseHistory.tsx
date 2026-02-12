"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

type GlucoseReading = {
    id: number;
    glucose_mgdl: number;
    meal_tag: string;
    notes: string;
    measured_at: string;
    insulin_units?: number;
    carbs_grams?: number;
};

export default function GlucoseHistory({ refreshTrigger }: { refreshTrigger?: number }) {
    const [readings, setReadings] = useState<GlucoseReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReadings = async () => {
        try {
            const data = await api.get<GlucoseReading[]>("/api/glucose?limit=5");
            setReadings(data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
            setError("Could not load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, [refreshTrigger]);

    if (loading) return <div className="text-zinc-500 text-sm animate-pulse">Loading history...</div>;
    if (error) return <div className="text-red-400 text-sm">{error}</div>;
    if (readings.length === 0) return <div className="text-zinc-500 text-sm">No logs yet.</div>;

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this log?")) return;
        try {
            await api.delete(`/api/glucose/${id}`);
            // Refresh logic - ideally we lift this up or just re-fetch locally
            fetchReadings();
            // Also trigger parent refresh if needed, but local fetch is enough for visual consistency
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete log");
        }
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Recent Flux</h3>
                <button
                    onClick={fetchReadings}
                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:text-blue-400 active:scale-95 transition-all uppercase tracking-widest"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                    Sync
                </button>
            </div>

            <div className="space-y-3">
                {readings.map((reading) => (
                    <div
                        key={reading.id}
                        className="group relative flex flex-col p-4 bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden transition-all hover:border-zinc-700 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-1.5 h-6 rounded-full 
                                    ${reading.glucose_mgdl > 180 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' :
                                        reading.glucose_mgdl < 70 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                                            'bg-emerald-500 shadow-[0_0_10px_#10b981]'}
                                `}></div>
                                <div className="font-black text-2xl text-white tracking-tighter">
                                    {reading.glucose_mgdl} <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">mg/dL</span>
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-black px-2 py-1 rounded-md" suppressHydrationWarning>
                                {(() => {
                                    const d = new Date(reading.measured_at);
                                    return isNaN(d.getTime()) ? 'Invalid Time' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-bold text-zinc-400 capitalize truncate max-w-[14rem]">
                                {reading.meal_tag ? (
                                    <span className="flex items-center gap-1.5">
                                        {reading.meal_tag.includes('fasting') && '🌅'}
                                        {reading.meal_tag.includes('pre_meal') && '🍽️'}
                                        {reading.meal_tag.includes('post_meal') && '🧪'}
                                        {reading.meal_tag.includes('bedtime') && '🌙'}
                                        {reading.meal_tag.replace('_', ' ')}
                                    </span>
                                ) : '— No Context —'}
                            </div>
                            <div className="flex gap-2">
                                {(reading.insulin_units || 0) > 0 && (
                                    <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {reading.insulin_units}u
                                    </span>
                                )}
                                {(reading.carbs_grams || 0) > 0 && (
                                    <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {reading.carbs_grams}g
                                    </span>
                                )}
                            </div>
                        </div>

                        {reading.notes && (
                            <div className="mt-2 text-[10px] italic text-zinc-500 leading-relaxed border-t border-zinc-800/50 pt-2 line-clamp-1">
                                "{reading.notes}"
                            </div>
                        )}

                        {/* Visible Delete Action for Mobile-Friendly UI */}
                        <button
                            onClick={() => handleDelete(reading.id)}
                            className="absolute -right-12 top-0 bottom-0 w-12 bg-rose-950/20 text-rose-500 opacity-0 group-hover:right-0 group-hover:opacity-100 transition-all flex items-center justify-center border-l border-rose-900/10 hover:bg-rose-900/30"
                            aria-label="Delete Entry"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
