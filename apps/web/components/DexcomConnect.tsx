"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DexcomConnect() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("dexcom_sync") === "success") {
            setStatus("success");
            // Clear param from URL after showing success
            window.history.replaceState({}, "", "/");
        }
    }, [searchParams]);

    const handleConnect = () => {
        // Redirect to Backend Login Route
        // Note: Using window.location to ensure full redirect
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        window.location.href = `${apiUrl}/api/dexcom/login`;
    };

    return (
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6">
            <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-3">Integrations</h3>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-900/40 rounded-lg flex items-center justify-center text-green-500 font-bold text-xs">
                        Dx
                    </div>
                    <div>
                        <div className="text-zinc-200 text-sm font-medium">Dexcom G7</div>
                        <div className="text-zinc-500 text-[10px]">Production</div>
                    </div>
                </div>
                <button
                    onClick={handleConnect}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-1.5 px-3 rounded-lg transition-colors"
                >
                    Connect
                </button>
            </div>

            {status === "success" && (
                <div className="mt-3 bg-green-500/10 text-green-400 text-xs p-2 rounded-lg text-center animate-fade-in">
                    ✅ Data synced from Dexcom!
                </div>
            )}
        </div>
    );
}
