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
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Add Log</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Glucose Input */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400">Glucose (mg/dL)</label>
                    <input
                        name="glucose"
                        type="number"
                        required
                        placeholder="e.g. 110"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-2xl font-bold text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>

                {/* Meal Tag */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400">Context</label>
                    <select
                        name="meal_tag"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                        defaultValue="fasting"
                    >
                        <option value="fasting">Fasting</option>
                        <option value="pre_meal">Pre-meal</option>
                        <option value="post_meal">Post-meal</option>
                        <option value="bedtime">Bedtime</option>
                        <option value="other">Other</option>
                    </select>
                </div>


                {/* Carbs & Insulin Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Carbs */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-400">Carbs (g)</label>
                        <input
                            name="carbs"
                            type="number"
                            placeholder="0"
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Insulin */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-400">Insulin (Units)</label>
                        <input
                            name="insulin"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-400">Notes (Optional)</label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="How do you feel?"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all 
            ${loading ? "bg-zinc-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/20"}
          `}
                >
                    {loading ? "Saving..." : "Save Log"}
                </button>

                {/* Feedback Messages */}
                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
                        ✅ Reading saved successfully!
                    </div>
                )}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

            </form>
        </div>
    );
}
