"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Download,
  AlertCircle,
} from "lucide-react";

export default function AttendanceTrendChart({ data = [], label = "Staff" }) {
  // 1. Safety Guard: If data is not an array or is empty
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white h-full min-h-[200px] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <BarChart2 className="mx-auto h-8 w-8 text-slate-200" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            No trend data available for {label}
          </p>
        </div>
      </Card>
    );
  }

  const exportToExcel = () => {
    const headers = ["Month", "Attendance Percentage"];
    const rows = data.map((item) => `${item.month},${item.percentage}%`);
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${label}_Trend_${new Date().getFullYear()}.csv`;
    link.click();
  };

  // 2. Calculation Safety: Ensure maxVal is never 0 to avoid Division by Zero
  const maxVal = Math.max(...data.map((d) => d.percentage || 0), 100);

  const currentMonth = data[data.length - 1];
  const prevMonth = data.length > 1 ? data[data.length - 2] : null;

  // Only calculate difference if we have 2 months of data
  const difference = prevMonth
    ? (currentMonth.percentage - prevMonth.percentage).toFixed(1)
    : 0;
  const isPositive = difference >= 0;

  return (
    <Card className="print:hidden border-none shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {label} Attendance Trend
            </CardTitle>

            {/* 3. Trend Badge - Only show if comparison exists */}
            {prevMonth ? (
              <div
                className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
                  isPositive
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-rose-600 bg-rose-50"
                }`}
              >
                {isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {Math.abs(difference)}% from {prevMonth.month}
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded w-fit">
                First month of data
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
            onClick={exportToExcel}
          >
            <Download size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 4. Chart Container with defined height */}
        <div className="flex items-end justify-between h-32 gap-3 mt-4">
          {data.map((item, index) => {
            // Safety: Ensure height is at least 5% so bar is visible even if 0%
            const heightPercentage = Math.max(
              (item.percentage / maxVal) * 100,
              5
            );

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group relative"
              >
                <div className="relative w-full flex justify-center items-end h-full">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                    {item.percentage}%
                  </div>

                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className={`w-full max-w-[32px] rounded-t-sm relative ${
                      item.percentage < 75 ? "bg-rose-400" : "bg-indigo-500"
                    }`}
                  >
                    {/* Inner glow for active bar */}
                    <div className="absolute inset-0 bg-white/10 rounded-t-sm" />
                  </motion.div>
                </div>

                {/* Month Label */}
                <span className="text-[9px] font-black text-slate-400 uppercase truncate w-full text-center">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
