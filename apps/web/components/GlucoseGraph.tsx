"use client";

import { Area, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

type GlucosePoint = {
    glucose_mgdl: number;
    measured_at: string;
    carbs_grams?: number;
    insulin_units?: number;
    time?: string;
    timestamp?: number;
};

type GlucoseGraphProps = {
    data: GlucosePoint[];
    height?: number;
    title?: string;
};

export default function GlucoseGraph({ data, height = 200, title }: GlucoseGraphProps) {
    if (!data || data.length === 0) {
        return (
            <div className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6 flex items-center justify-center text-zinc-600 text-xs`} style={{ height: height + 60 }}>
                {title && <h3 className="absolute top-4 left-4 text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>}
                No data available
            </div>
        );
    }

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-6 relative">
            {title && (
                <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                </div>
            )}

            <div className="w-full -ml-4" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                        <XAxis
                            dataKey="time"
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />

                        <YAxis
                            yAxisId="glucose"
                            hide={false}
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />

                        <YAxis
                            yAxisId="events"
                            orientation="right"
                            hide={true}
                            domain={[0, 600]}
                        />

                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />

                        <ReferenceLine yAxisId="glucose" y={70} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine yAxisId="glucose" y={180} stroke="#f97316" strokeDasharray="3 3" />

                        <Area
                            yAxisId="glucose"
                            type="monotone"
                            dataKey="glucose_mgdl"
                            name="Glucose"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGlucose)"
                        />

                        <Bar
                            yAxisId="events"
                            dataKey="carbs_grams"
                            name="Carbs (g)"
                            fill="#fb923c"
                            barSize={4}
                            radius={[2, 2, 0, 0]}
                            fillOpacity={0.8}
                        />

                        <Bar
                            yAxisId="events"
                            dataKey="insulin_units"
                            name="Insulin (u)"
                            fill="#8b5cf6"
                            barSize={4}
                            radius={[2, 2, 0, 0]}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
