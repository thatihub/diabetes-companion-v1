"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function InsightCard() {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setAnalysis(null);
        try {
            const res = await api.post<{ analysis: string }>("/api/insights/analyze", {});
            setAnalysis(res.analysis);
        } catch (err) {
            console.error(err);
            setAnalysis("Failed to generate insights. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-4 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-indigo-200 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                    ✨ AI Insights
                </h3>
            </div>

            {!analysis && !loading && (
                <div className="text-center py-2">
                    <p className="text-zinc-400 text-xs mb-3">
                        Get a summary of your recent patterns and tips based on your last 48h data.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Analyze Patterns</span>
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-300 text-xs animate-pulse">Analyzing your data...</p>
                </div>
            )}

            {analysis && (
                <div className="mt-2 space-y-3 animate-fade-in">
                    <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-xl border border-white/5">
                        {analysis}
                    </div>
                    <button
                        onClick={() => setAnalysis(null)}
                        className="text-white/50 text-xs hover:text-white w-full text-center"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
