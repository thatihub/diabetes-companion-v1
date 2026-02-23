"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DexcomConnect() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        const syncParam = searchParams.get("dexcom_sync");
        if (syncParam === "success" || syncParam === "started") {
            setStatus("syncing");
            // Clear param from URL
            window.history.replaceState({}, "", "/");

            // Auto-hide after 5s
            setTimeout(() => setStatus(null), 5000);
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
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Live Connection</p>
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={status === "syncing"}
                    className={`group relative overflow-hidden px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500
                        ${status === "syncing"
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                            : 'bg-teal-500 text-slate-950 hover:bg-teal-400 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:scale-[1.02] active:scale-95 border border-teal-400/50'
                        }`}
                >
                    {/* Action-oriented Shimmer Effect */}
                    {status !== "syncing" && (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                    )}

                    <span className="relative z-10 flex items-center gap-3">
                        {status === "syncing" ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" suppressHydrationWarning={true}>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" suppressHydrationWarning={true}></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-700" suppressHydrationWarning={true}>
                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                    <path d="M21 3v5h-5" />
                                </svg>
                                Sync Live Data
                            </>
                        )}
                    </span>
                </button>
            </div>

            {status === "syncing" && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl animate-in fade-in slide-in-from-top-1">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">
                        Protocol Initiated — Data Stream Updating
                    </p>
                </div>
            )}
        </div>
    );
}
