"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DexcomConnect() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);
    const isSyncing = status === "syncing";

    useEffect(() => {
        const syncParam = searchParams.get("dexcom_sync");
        if (syncParam === "success" || syncParam === "started") {
            const beginTimer = window.setTimeout(() => setStatus("syncing"), 0);
            // Clear param from URL
            window.history.replaceState({}, "", "/");

            // Auto-hide after 5s
            const endTimer = window.setTimeout(() => setStatus(null), 5000);
            return () => {
                window.clearTimeout(beginTimer);
                window.clearTimeout(endTimer);
            };
        }
    }, [searchParams]);

    const handleConnect = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        window.location.href = `${apiUrl}/api/dexcom/login`;
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 font-black text-xs shadow-inner">
                        <span className="tracking-tighter">Dx</span>
                    </div>
                    <div>
                        <h4 className="text-slate-100 text-sm font-bold tracking-tight">Dexcom G7</h4>
                        <div className="mt-1 flex items-center gap-2">
                            <span
                                className={`relative inline-flex h-3.5 w-3.5 rounded-full border ${isSyncing
                                    ? "border-emerald-300/50 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                    : "border-slate-400/40 bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]"
                                    }`}
                            >
                                <span
                                    className={`absolute inset-0 rounded-full ${isSyncing ? "animate-ping bg-emerald-300/60" : "animate-pulse bg-slate-300/20"
                                        }`}
                                />
                                <span className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/80" />
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Live Connection
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={isSyncing}
                    className={`group relative overflow-hidden whitespace-nowrap min-w-[112px] px-5 sm:px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-500
                        ${isSyncing
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                            : 'bg-sky-500 text-slate-950 hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 border border-sky-400/50'
                        }`}
                >
                    {/* Action-oriented Shimmer Effect */}
                    {!isSyncing && (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSyncing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" suppressHydrationWarning={true}>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" suppressHydrationWarning={true}></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                AUTH
                            </>
                        ) : (
                            <span className="w-full text-center">SYNC</span>
                        )}
                    </span>
                </button>
            </div>

            <div
                className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 transition-all ${isSyncing
                    ? "animate-in fade-in slide-in-from-top-1 border-emerald-500/20 bg-emerald-500/5"
                    : "border-slate-700/40 bg-slate-800/20"
                    }`}
            >
                <span
                    className={`relative inline-flex h-3.5 w-3.5 rounded-full border ${isSyncing
                        ? "border-emerald-300/50 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                        : "border-slate-400/40 bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.45)]"
                        }`}
                >
                    <span className={`absolute inset-0 rounded-full ${isSyncing ? "animate-ping bg-emerald-300/60" : "animate-pulse bg-slate-300/25"}`} />
                    <span className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isSyncing ? "text-emerald-300" : "text-slate-400"}`}>
                    {isSyncing ? "Protocol Initiated — Data Stream Updating" : "Ready — Sync is on standby"}
                </p>
            </div>
        </div>
    );
}
