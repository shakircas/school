"use client";

import { useMemo } from "react";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md bg-opacity-95">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-lg font-black">
            {payload[0].value}%{" "}
            <span className="text-xs font-normal text-slate-400 font-sans">
              Risk
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function RiskTrendChart({ trendData }) {
  const isImproving = useMemo(() => {
    if (!trendData || trendData.length < 2) return true;
    return (
      trendData[trendData.length - 1].averageRisk < trendData[0].averageRisk
    );
  }, [trendData]);

  // Handle empty state gracefully
  if (!trendData || trendData.length === 0) return null;

  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 px-8 pt-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">
              Risk Velocity
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Class Trend Analysis
            </CardDescription>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isImproving
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}
        >
          {isImproving ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5" />
          )}
          {isImproving ? "Improving" : "Critical Trend"}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[350px] w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="10 10"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="exam"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                dy={15}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                domain={[0, 100]}
                dx={-10}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#6366f1",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />

              <Area
                type="monotone"
                dataKey="averageRisk"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRisk)"
                animationDuration={2500}
                activeDot={{
                  r: 8,
                  fill: "#6366f1",
                  stroke: "#fff",
                  strokeWidth: 4,
                  className: "shadow-2xl",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
