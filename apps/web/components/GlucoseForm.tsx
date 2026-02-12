"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function GlucoseForm({ onReadingSaved }: { onReadingSaved?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            glucose_mgdl: Number(formData.get("glucose")),
            meal_tag: formData.get("meal_tag"),
            notes: formData.get("notes"),
            carbs_grams: Number(formData.get("carbs")) || 0,
            insulin_units: Number(formData.get("insulin")) || 0,
        };

        try {
            await api.post("/api/glucose", data);
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
            if (onReadingSaved) onReadingSaved();

            // Auto-hide success message after 3s
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error(err);
            // Show actual error message if available, otherwise generic
            const message = err?.message || "Unknown error occurred";
            setError(`Error: ${message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Manual Log</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Glucose Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Current Glucose</label>
                    <div className="relative">
                        <input
                            name="glucose"
                            type="number"
                            required
                            placeholder="000"
                            className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-3xl font-black text-white placeholder-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-xs">mg/dL</span>
                    </div>
                </div>

                {/* Context & Tags */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Event Context</label>
                    <div className="relative">
                        <select
                            name="meal_tag"
                            className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            defaultValue="fasting"
                        >
                            <option value="fasting">🌅 Fasting / Morning</option>
                            <option value="pre_meal">🍽️ Pre-meal</option>
                            <option value="post_meal">🧪 Post-meal</option>
                            <option value="bedtime">🌙 Bedtime</option>
                            <option value="other">📋 Other</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>


                {/* Carbs & Insulin Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Carbs */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Carbs</label>
                        <div className="relative">
                            <input
                                name="carbs"
                                type="number"
                                placeholder="0"
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-black text-emerald-400 placeholder-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-bold">g</span>
                        </div>
                    </div>

                    {/* Insulin */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Insulin</label>
                        <div className="relative">
                            <input
                                name="insulin"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-black text-rose-400 placeholder-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-bold">u</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Notes</label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="Add a quick note..."
                        className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-300 placeholder-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all 
            ${loading ? "bg-zinc-800 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20"}
          `}
                >
                    {loading ? "Recording..." : "Capture Data Entry"}
                </button>

                {/* Feedback Messages */}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                        🎉 Entry Synchronized
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

            </form>
        </div>
    );
}
