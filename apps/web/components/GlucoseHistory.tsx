"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

type GlucoseReading = {
    id: number;
    glucose_mgdl: number;
    meal_tag: string;
    notes: string;
    measured_at: string;
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
                        className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
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
                                <div className="text-xs text-zinc-400 capitalize">
                                    {reading.meal_tag.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-zinc-500">
                                {new Date(reading.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs text-zinc-600">
                                {new Date(reading.measured_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
