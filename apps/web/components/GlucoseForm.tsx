"use client";

import { useRef, useState } from "react";
import { api } from "../lib/api";

export default function GlucoseForm({ onReadingSaved }: { onReadingSaved?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [estimateLoading, setEstimateLoading] = useState(false);
    const [estimateError, setEstimateError] = useState("");
    const [mealPhotoPreview, setMealPhotoPreview] = useState<string | null>(null);
    const [mealEstimate, setMealEstimate] = useState<{
        totals: { carbs_g: number; protein_g: number; fat_g: number };
        items: Array<{ name: string; carbs_g: number; protein_g: number; fat_g: number }>;
        notes: string;
        confidence: "low" | "medium" | "high";
    } | null>(null);
    const [copiedLabel, setCopiedLabel] = useState<"" | "carbs" | "full">("");
    const carbsInputRef = useRef<HTMLInputElement | null>(null);
    const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
    const mealTagRef = useRef<HTMLSelectElement | null>(null);

    const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
    });

    const compressImage = async (file: File): Promise<string> => {
        const rawDataUrl = await fileToDataUrl(file);
        const img = document.createElement("img");
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = rawDataUrl;
        });

        const maxWidth = 1280;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return rawDataUrl;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL("image/jpeg", 0.78);
    };

    const handleEstimateFromPhoto = async (file: File) => {
        setEstimateError("");
        setMealEstimate(null);
        setEstimateLoading(true);
        try {
            const imageData = await compressImage(file);
            setMealPhotoPreview(imageData);
            const result = await api.post<{
                totals: { carbs_g: number; protein_g: number; fat_g: number };
                items: Array<{ name: string; carbs_g: number; protein_g: number; fat_g: number }>;
                notes: string;
                confidence: "low" | "medium" | "high";
            }>("/api/insights/meal-estimate", { imageData });
            setMealEstimate(result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown estimation error";
            setEstimateError(`AI estimate failed: ${message}`);
        } finally {
            setEstimateLoading(false);
        }
    };

    const applyEstimateToForm = () => {
        if (!mealEstimate) return;
        if (carbsInputRef.current) carbsInputRef.current.value = String(Math.round(mealEstimate.totals.carbs_g));
        if (mealTagRef.current && mealTagRef.current.value === "fasting") mealTagRef.current.value = "post_meal";
        if (notesInputRef.current) {
            const existing = notesInputRef.current.value.trim();
            const aiNote = `AI meal estimate (approx): Protein ${mealEstimate.totals.protein_g}g, Fat ${mealEstimate.totals.fat_g}g, Confidence ${mealEstimate.confidence}.`;
            notesInputRef.current.value = existing ? `${existing}\n${aiNote}` : aiNote;
        }
    };

    const copyText = async (value: string, label: "carbs" | "full") => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                setCopiedLabel(label);
                setTimeout(() => setCopiedLabel(""), 1800);
            }
        } catch {
            setEstimateError("Clipboard copy failed. Please copy manually.");
        }
    };

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
                <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">AI Meal Camera Estimate</p>
                        <label className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-200 hover:border-sky-400 hover:text-white transition-colors">
                            {estimateLoading ? "Estimating..." : "Take Photo"}
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                disabled={estimateLoading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void handleEstimateFromPhoto(file);
                                    e.currentTarget.value = "";
                                }}
                            />
                        </label>
                    </div>
                    {mealPhotoPreview && (
                        <img src={mealPhotoPreview} alt="Meal preview" className="h-36 w-full rounded-xl object-cover border border-slate-700/60" />
                    )}
                    {mealEstimate && (
                        <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-950/60 p-3">
                            <p className="text-xs font-bold text-slate-200">
                                Carbs {mealEstimate.totals.carbs_g}g · Protein {mealEstimate.totals.protein_g}g · Fat {mealEstimate.totals.fat_g}g
                            </p>
                            {mealEstimate.items?.length > 0 && (
                                <div className="space-y-1">
                                    {mealEstimate.items.slice(0, 4).map((item, idx) => (
                                        <p key={`${item.name}-${idx}`} className="text-[11px] text-slate-400">
                                            {item.name}: {item.carbs_g}C / {item.protein_g}P / {item.fat_g}F
                                        </p>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] text-slate-500">Confidence: {mealEstimate.confidence.toUpperCase()}</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => copyText(String(Math.round(mealEstimate.totals.carbs_g)), "carbs")}
                                    className="rounded-xl border border-sky-400/40 bg-sky-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-sky-200 hover:bg-sky-500/30"
                                >
                                    Copy Carbs
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copyText(`Carbs ${mealEstimate.totals.carbs_g}g, Protein ${mealEstimate.totals.protein_g}g, Fat ${mealEstimate.totals.fat_g}g`, "full")}
                                    className="rounded-xl border border-slate-500/40 bg-slate-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-200 hover:bg-slate-500/30"
                                >
                                    Copy Full Macros
                                </button>
                                <button
                                    type="button"
                                    onClick={applyEstimateToForm}
                                    className="rounded-xl border border-teal-400/40 bg-teal-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-teal-200 hover:bg-teal-500/30"
                                >
                                    Apply Estimate To Form
                                </button>
                            </div>
                            {copiedLabel && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                                    {copiedLabel === "carbs" ? "Copied carbs for Dexcom" : "Copied full macros"}
                                </p>
                            )}
                            <p className="text-[10px] text-slate-500">Dexcom supports carbs only. Protein/fat are kept in this app.</p>
                        </div>
                    )}
                    {estimateError && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-rose-400">{estimateError}</p>
                    )}
                </div>

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
                            ref={mealTagRef}
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
                                ref={carbsInputRef}
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
                        ref={notesInputRef}
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
