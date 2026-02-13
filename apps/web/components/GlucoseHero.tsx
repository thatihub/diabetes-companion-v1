"use client";

import React from "react";

interface GlucoseHeroProps {
    currentValue: number | null;
    trend?: "steady" | "rising" | "falling";
    timeInRange?: number;
}

export const GlucoseHero: React.FC<GlucoseHeroProps> = ({
    currentValue,
    trend = "steady",
    timeInRange = 85,
}) => {
    // Determine color based on glucose level
    const getStatusColor = (val: number | null) => {
        if (!val) return "text-slate-400";
        if (val < 70) return "text-rose-400";
        if (val > 180) return "text-amber-400";
        return "text-teal-400";
    };

    const getStrokeDashArray = (val: number) => {
        const radius = 120;
        const circumference = 2 * Math.PI * radius;
        // We map 40-400 mg/dL to 0-100% of the circle
        const percentage = Math.min(Math.max((val - 40) / (400 - 40), 0), 1);
        return `${percentage * circumference} ${circumference}`;
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 px-6 relative">
            {/* Background Decorative Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

            {/* Main Circle Gauge */}
            <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 300 300">
                    {/* Background Track */}
                    <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Progress Overlay */}
                    <circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={getStrokeDashArray(currentValue || 100)}
                        strokeLinecap="round"
                        className={`${getStatusColor(currentValue)} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                    />
                </svg>

                {/* Content Inside Circle */}
                <div className="text-center z-10">
                    <p className="text-slate-500 text-sm font-medium tracking-widest uppercase mb-1">Current</p>
                    <h2 className="text-7xl font-bold tracking-tighter tabular-nums flex items-baseline justify-center">
                        {currentValue || "--"}
                        <span className="text-sm font-medium text-slate-500 ml-1 tracking-normal">mg/dL</span>
                    </h2>
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <span className={`w-2 h-2 rounded-full ${currentValue && currentValue >= 70 && currentValue <= 180 ? 'bg-teal-400' : 'bg-rose-400'}`}></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                                {trend === "steady" ? "→ Steady" : trend === "rising" ? "↑ Rising" : "↓ Falling"}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-1">
                            Time in Range: <span className="text-slate-300">{timeInRange}%</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
