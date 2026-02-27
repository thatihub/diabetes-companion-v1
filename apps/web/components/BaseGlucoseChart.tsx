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

interface BaseGlucoseChartProps {
    data: GlucosePoint[];
    height?: number | string;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showGrid?: boolean;
}

export default function BaseGlucoseChart({ 
    data, 
    height = "100%", 
    showXAxis = true, 
    showYAxis = true,
    showGrid = true
}: BaseGlucoseChartProps) {
    if (data.length === 0) {
        return <div className="flex items-center justify-center text-zinc-600 text-xs h-full">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data}>
                <defs>
                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />}

                {/* Time Axis */}
                {showXAxis && (
                    <XAxis
                        dataKey="time"
                        stroke="#52525b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                )}

                {/* Glucose Axis (Left) */}
                {showYAxis && (
                    <YAxis
                        yAxisId="glucose"
                        hide={false}
                        stroke="#52525b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[40, 300]}
                        allowDataOverflow={false}
                    />
                )}

                {/* Carbs/Insulin Axis (Right, Hidden or Small) */}
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

                {/* Main Glucose Trend */}
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

                {/* Carbs Bar (Orange) */}
                <Bar
                    yAxisId="events"
                    dataKey="carbs_grams"
                    name="Carbs (g)"
                    fill="#fb923c"
                    barSize={12}
                    radius={[5, 5, 0, 0]}
                    fillOpacity={0.75}
                />

                {/* Insulin Bar (Purple/Blue) */}
                <Bar
                    yAxisId="events"
                    dataKey="insulin_units"
                    name="Insulin (u)"
                    fill="#8b5cf6"
                    barSize={20}
                    radius={[6, 6, 0, 0]}
                />

            </ComposedChart>
        </ResponsiveContainer>
    );
}
