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
        <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Recent Logs</h3>
                <button
                    onClick={fetchReadings}
                    className="text-xs text-blue-500 hover:text-blue-400"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-2">
                {readings.map((reading) => (
                    <div
                        key={reading.id}
                        className="group flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`
                w-2 h-8 rounded-full 
                ${reading.glucose_mgdl > 180 ? 'bg-orange-500' :
                                    reading.glucose_mgdl < 70 ? 'bg-red-500' : 'bg-green-500'}
              `}></div>

                            <div className="text-left">
                                <div className="font-bold text-white text-lg leading-none">
                                    {reading.glucose_mgdl} <span className="text-xs text-zinc-500 font-normal">mg/dL</span>
                                </div>
                                <div className="text-xs text-zinc-400 capitalize truncate max-w-[12rem]">
                                    {reading.meal_tag ? reading.meal_tag.replace('_', ' ') :
                                        reading.notes ? reading.notes : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="text-right space-y-1">
                            <div className="flex justify-end gap-2">
                                {(reading.insulin_units || 0) > 0 && (
                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded">
                                        {reading.insulin_units}u
                                    </span>
                                )}
                                {(reading.carbs_grams || 0) > 0 && (
                                    <span className="text-[10px] font-bold text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded">
                                        {reading.carbs_grams}g
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-zinc-500" suppressHydrationWarning>
                                {(() => {
                                    const d = new Date(reading.measured_at);
                                    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                            </div>
                        </div>

                        {/* Delete Button (Visible on hover or always on mobile via spacing? Let's make it absolute right) */}
                        <button
                            onClick={() => handleDelete(reading.id)}
                            className="absolute right-0 top-0 bottom-0 w-12 bg-red-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                            aria-label="Delete"
                        >
                            <span className="text-xl font-bold">×</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
