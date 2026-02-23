"use client";

import { useState } from "react";
import { api } from "../lib/api";
import SpeakButton from "./SpeakButton";

interface InsightCardProps {
    startDate?: string | Date;
    endDate?: string | Date;
    context?: "weekly" | "comparison" | "general";
    title?: string;
}

type InsightPayload = {
    context: "weekly" | "comparison" | "general";
    startDate?: string | Date;
    endDate?: string | Date;
};

export default function InsightCard({
    startDate,
    endDate,
    context = "general",
    title = "✨ AI Insights"
}: InsightCardProps) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setAnalysis(null);
        try {
            const payload: InsightPayload = { context };
            if (startDate) payload.startDate = startDate;
            if (endDate) payload.endDate = endDate;

            const res = await api.post<{ analysis: string }>("/api/insights/analyze", payload);
            setAnalysis(res.analysis);
        } catch (err: unknown) {
            console.error("Insight Error:", err);
            // Try to extract message
            let msg = "Failed to generate insights.";
            if (err instanceof Error && err.message) msg += ` (${err.message})`;
            setAnalysis(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-indigo-950/40 border border-indigo-500/20 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="text-xl">✨</span> {title}
                </h3>
            </div>

            {!analysis && !loading && (
                <div className="space-y-4">
                    <p className="text-indigo-300/60 text-xs font-medium leading-relaxed">
                        Decrypt metabolic patterns and receive physiological optimization advice.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        className="ai-insight-btn"
                    >
                        Generate AI Insight
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Computing Insights...</p>
                </div>
            )}

            {analysis && (
                <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex justify-end">
                        <SpeakButton text={analysis} />
                    </div>
                    <div className="text-zinc-200 text-xs md:text-sm leading-relaxed whitespace-pre-line bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        {analysis}
                    </div>
                    <button
                        onClick={() => setAnalysis(null)}
                        className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest w-full text-center py-2 transition-colors"
                    >
                        Dismiss Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
