"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Filter, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Modern SaaS Palette
const COLORS = {
  Stable: "#10b981", // Emerald 500
  Warning: "#f59e0b", // Amber 500
  Critical: "#ef4444", // Red 500
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {payload[0].name}
        </p>
        <p className="text-lg font-black">
          {payload[0].value}{" "}
          <span className="text-xs font-normal opacity-60">Students</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ClassRiskPieChart({ data = [] }) {
  // 1. Calculate totals for the center label
  const totalStudents = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  // 2. Ensure data exists to avoid Recharts crashes
  const hasData = totalStudents > 0;

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-8 pt-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">
              Distribution
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Risk Segmentation
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-[320px] w-full relative">
          {hasData ? (
            <>
              {/* Center Label (The "Donut Hole" Text) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800 leading-none">
                  {totalStudents}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Total Class
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={85}
                    outerRadius={110}
                    paddingAngle={8}
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name] || "#cbd5e1"}
                        className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <Users className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm font-medium">No Data Available</p>
            </div>
          )}
        </div>

        {/* Custom Legend Section */}
        <div className="grid grid-cols-3 gap-2 mt-4 px-4 pb-4">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div
                className="w-2 h-2 rounded-full mb-2"
                style={{ backgroundColor: COLORS[item.name] }}
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                {item.name}
              </span>
              <span className="text-sm font-black text-slate-700">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
