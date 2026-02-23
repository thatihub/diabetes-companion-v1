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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this health log?")) return;
        try {
            await api.delete(`/api/glucose/${id}`);
            fetchReadings();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    if (loading && readings.length === 0) {
        return (
            <div className="px-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 w-full bg-slate-800/20 animate-pulse rounded-[24px]"></div>
                ))}
            </div>
        );
    }

    if (error) return <div className="px-6 py-4 text-rose-400 text-xs font-bold uppercase tracking-widest">{error}</div>;
    if (readings.length === 0) return <div className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">No logs yet.</div>;

    return (
        <div className="px-6 space-y-6">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h3 className="text-slate-100 text-lg font-bold tracking-tight">Timeline</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Late Activity</p>
                </div>
                <button
                    onClick={fetchReadings}
                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-full border border-slate-700/50 text-teal-400 transition-all active:scale-90"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning={true}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                </button>
            </div>

            <div className="space-y-4">
                {readings.map((reading) => (
                    <div
                        key={reading.id}
                        className="wellness-card p-5 group flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            {/* Visual Indicator Layer */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                                ${reading.glucose_mgdl > 180 ? 'bg-amber-500/10 text-amber-500' :
                                    reading.glucose_mgdl < 70 ? 'bg-rose-500/10 text-rose-500' :
                                        'bg-teal-500/10 text-teal-500'}`}
                            >
                                <span className="text-xl font-black">{reading.glucose_mgdl || '--'}</span>
                            </div>

                            <div>
                                <p className="text-slate-100 text-xs font-bold uppercase tracking-wider">
                                    {reading.meal_tag ? reading.meal_tag.replace('_', ' ') : 'General Log'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" suppressHydrationWarning={true}>
                                        {isMounted ? new Date(reading.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </span>
                                    {reading.insulin_units && (
                                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase rounded-full">💉 {reading.insulin_units}u</span>
                                    )}
                                    {reading.carbs_grams && (
                                        <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase rounded-full">🍴 {reading.carbs_grams}g</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(reading.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
