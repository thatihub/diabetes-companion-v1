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
        const parseOptionalNumber = (value: FormDataEntryValue | null) => {
            const raw = typeof value === "string" ? value.trim() : "";
            if (!raw) return null;
            const num = Number(raw);
            return Number.isFinite(num) ? num : null;
        };
        const data = {
            glucose_mgdl: Number(formData.get("glucose")),
            meal_tag: formData.get("meal_tag"),
            notes: formData.get("notes"),
            carbs_grams: parseOptionalNumber(formData.get("carbs")),
            insulin_units: parseOptionalNumber(formData.get("insulin")),
        };

        try {
            await api.post("/api/glucose", data);
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
            if (onReadingSaved) onReadingSaved();

            // Auto-hide success message after 3s
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            console.error(err);
            // Show actual error message if available, otherwise generic
            const message = err instanceof Error ? err.message : "Unknown error occurred";
            setError(`Error: ${message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="wellness-card p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6 tracking-tight">Manual Entry</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Glucose Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Blood Glucose</label>
                    <div className="relative">
                        <input
                            name="glucose"
                            type="number"
                            required
                            placeholder="000"
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-3xl font-black text-slate-100 placeholder-slate-800 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all outline-none"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">mg/dL</span>
                    </div>
                </div>

                {/* Context & Tags */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Event Context</label>
                    <div className="relative">
                        <select
                            name="meal_tag"
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-300 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 outline-none appearance-none cursor-pointer"
                            defaultValue="fasting"
                        >
                            <option value="fasting">🌅 Fasting / Morning</option>
                            <option value="pre_meal">🍽️ Pre-meal</option>
                            <option value="post_meal">🧪 Post-meal</option>
                            <option value="bedtime">🌙 Bedtime</option>
                            <option value="other">📋 Other</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>


                {/* Carbs & Insulin Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Carbs */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Carbs</label>
                        <div className="relative">
                            <input
                                name="carbs"
                                type="number"
                                placeholder="0"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-black text-teal-400 placeholder-slate-800 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-bold">g</span>
                        </div>
                    </div>

                    {/* Insulin */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Insulin</label>
                        <div className="relative">
                            <input
                                name="insulin"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-black text-rose-400 placeholder-slate-800 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-bold">u</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Notes</label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="Add a quick note..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-medium text-slate-300 placeholder-slate-800 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 outline-none resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] text-slate-100 transition-all 
            ${loading ? "bg-slate-800 cursor-not-allowed" : "bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 hover:scale-[1.02] active:scale-95 shadow-xl shadow-teal-500/5"}
          `}
                >
                    {loading ? "Recording..." : "Synchronize Entry"}
                </button>

                {/* Feedback Messages */}
                {success && (
                    <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400 text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                        🎉 Log Saved Successfully
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

            </form>
        </div>
    );
}
