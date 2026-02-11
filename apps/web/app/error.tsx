"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-white bg-black">
            <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-2xl max-w-md">
                <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong!</h2>
                <p className="text-zinc-400 mb-6 text-sm">{error.message || "An unexpected error occurred."}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
