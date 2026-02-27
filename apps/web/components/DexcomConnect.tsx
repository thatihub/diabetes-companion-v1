"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api } from "../lib/api";

const DATA_MODE_KEY = "data_mode";
const MODE_EVENT = "data-mode-change";

function readDataMode(): "real" | "demo" {
    if (typeof window === "undefined") return "real";
    const stored = window.localStorage.getItem(DATA_MODE_KEY);
    return stored === "demo" ? "demo" : "real";
}

function subscribeDataMode(onStoreChange: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => onStoreChange();
    window.addEventListener("storage", handler);
    window.addEventListener(MODE_EVENT, handler);
    return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(MODE_EVENT, handler);
    };
}

export default function DexcomConnect() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [health, setHealth] = useState<"healthy" | "degraded" | "error">("healthy");
    const [toast, setToast] = useState<string | null>(null);
    const mode = useSyncExternalStore(subscribeDataMode, readDataMode, () => "real");
    const isDemoMode = mode === "demo";
    const isSyncing = status === "syncing";
    const isConnectDisabled = isSyncing || isDemoMode;

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

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get<{ last_sync?: string; last_sync_stats?: { count?: number; latest?: string; carb_gap_hours?: number; }; }>("https://diabetes-companion-api.onrender.com/api/dexcom/status");
                setLastSync(res.last_sync || null);
                if (res.last_sync_stats?.carb_gap_hours !== undefined && res.last_sync_stats.carb_gap_hours !== null && res.last_sync_stats.carb_gap_hours > 24) {
                    setHealth("degraded");
                } else {
                    setHealth("healthy");
                }
            } catch {
                setLastSync(null);
                setHealth("error");
                setToast("Dexcom status unavailable. Check connection.");
                setTimeout(() => setToast(null), 4500);
            }
        };
        fetchStatus();
    }, []);

    const handleConnect = () => {
        if (isDemoMode) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        window.location.href = `${apiUrl}/api/dexcom/login`;
    };

    return (
        <div className="w-full relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                                    : isDemoMode
                                        ? "border-amber-300/50 bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                                    : "border-slate-400/40 bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]"
                                    }`}
                            >
                                <span
                                    className={`absolute inset-0 rounded-full ${isSyncing
                                        ? "animate-ping bg-emerald-300/60"
                                        : isDemoMode
                                            ? "bg-amber-200/30"
                                            : "animate-pulse bg-slate-300/20"
                                        }`}
                                />
                                <span className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/80" />
                            </span>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDemoMode ? "text-amber-300" : health === "degraded" ? "text-amber-300" : health === "error" ? "text-rose-400" : "text-slate-500"}`}>
                                {isDemoMode ? "Demo Connection" : health === "degraded" ? "Live (Degraded)" : health === "error" ? "Live (Error)" : "Live Connection"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={isConnectDisabled}
                    className={`group relative overflow-hidden whitespace-nowrap min-w-[112px] w-full sm:w-auto px-5 sm:px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-500
                        ${isConnectDisabled
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                            : 'bg-sky-500 text-slate-950 hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 border border-sky-400/50'
                        }`}
                >
                    {/* Action-oriented Shimmer Effect */}
                    {!isConnectDisabled && (
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
                        ) : isDemoMode ? (
                            <span className="w-full text-center">DEMO</span>
                        ) : (
                            <span className="w-full text-center">SYNC</span>
                        )}
                    </span>
                </button>
        </div>

            <div
                className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 transition-all ${isSyncing
                    ? "animate-in fade-in slide-in-from-top-1 border-emerald-500/20 bg-emerald-500/5"
                    : health === "degraded"
                        ? "border-amber-400/30 bg-amber-400/10"
                        : health === "error"
                            ? "border-rose-400/40 bg-rose-500/10"
                            : "border-slate-700/40 bg-slate-800/20"
                    }`}
            >
                <span
                    className={`relative inline-flex h-3.5 w-3.5 rounded-full border ${isSyncing
                        ? "border-emerald-300/50 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                        : isDemoMode
                            ? "border-amber-300/50 bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                        : health === "degraded"
                            ? "border-amber-300/60 bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                            : health === "error"
                                ? "border-rose-300/60 bg-rose-400 shadow-[0_0_12px_rgba(248,113,113,0.7)]"
                                : "border-slate-400/40 bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.45)]"
                        }`}
                >
                    <span className={`absolute inset-0 rounded-full ${isSyncing ? "animate-ping bg-emerald-300/60" : isDemoMode ? "bg-amber-200/35" : "animate-pulse bg-slate-300/25"}`} />
                    <span className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
                <div className="flex flex-col gap-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isSyncing ? "text-emerald-300" : isDemoMode ? "text-amber-300" : health === "degraded" ? "text-amber-200" : health === "error" ? "text-rose-300" : "text-slate-400"}`}>
                        {isSyncing
                            ? "Protocol Initiated — Data Stream Updating"
                            : isDemoMode
                                ? "Demo mode — Live sync is disabled"
                                : health === "degraded"
                                    ? "Degraded — No carbs seen >24h"
                                    : health === "error"
                                        ? "Connection issue — Tap sync or re-auth"
                                        : "Ready — Sync is on standby"}
                    </p>
                    {lastSync && (
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Last successful sync: {new Date(lastSync).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
            {toast && (
                <div className="absolute bottom-[-76px] right-0 z-[9999] max-w-xs rounded-2xl border border-rose-400/50 bg-rose-500/20 px-4 py-3 text-[12px] font-semibold text-rose-50 shadow-xl">
                    {toast}
                </div>
            )}
        </div>
    );
}
