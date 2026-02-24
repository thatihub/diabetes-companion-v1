"use client";

import { useSyncExternalStore } from "react";

type DataMode = "real" | "demo";

const STORAGE_KEY = "data_mode";
const MODE_EVENT = "data-mode-change";

function readMode(): DataMode {
  if (typeof window === "undefined") return "real";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "demo" || stored === "real" ? stored : "real";
}

function subscribeMode(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(MODE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(MODE_EVENT, handler);
  };
}

export default function DataModeToggle() {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "real");

  const setDataMode = (next: DataMode) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(MODE_EVENT));
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center rounded-xl border border-slate-700/70 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setDataMode("real")}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
            mode === "real" ? "bg-slate-200 text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          Real
        </button>
        <button
          type="button"
          onClick={() => setDataMode("demo")}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
            mode === "demo" ? "bg-sky-400 text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          Demo
        </button>
      </div>
      {mode === "demo" && (
        <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200">
          Demo mode active
        </span>
      )}
    </div>
  );
}
