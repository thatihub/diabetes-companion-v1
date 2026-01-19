import Image from "next/image";
import GlucoseForm from "../components/GlucoseForm";
import GlucoseHistory from "../components/GlucoseHistory";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 space-y-8">

      {/* Hero Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Diabetes <span className="text-blue-500">Companion</span>
        </h1>
        <p className="text-zinc-500 text-sm">
          Track your levels, gain insights.
        </p>
      </div>

      {/* Main Form */}
      <GlucoseForm />

      {/* History Section */}
      <GlucoseHistory />

      {/* Footer / Status */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-zinc-500">System Online</span>
        </div>

        {/* Debug Info - Remove later */}
        <div className="text-[10px] text-zinc-700 font-mono">
          API: {process.env.NEXT_PUBLIC_API_BASE_URL || "Localhost"}
        </div>
      </div>

    </main>
  );
}
