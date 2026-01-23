"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Download } from "lucide-react";

export default function AttendanceTrendChart({ data = [], label = "Staff" }) {
  // 1. Safety Guard
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

  // Updated Export Logic to include Session Average
  const exportToExcel = () => {
    const headers = ["Month", "Monthly %", "Session YTD %"];
    const rows = data.map(
      (item) => `${item.month},${item.percentage}%,${item.sessionAvg}%`
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${label}_Trend_Session_${new Date().getFullYear()}.csv`;
    link.click();
  };

  const maxVal = 100; // Attendance is always out of 100
  const currentMonth = data[data.length - 1];
  const prevMonth = data.length > 1 ? data[data.length - 2] : null;

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
              {label} Performance: Monthly vs Session
            </CardTitle>

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
                First month of session
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Legend for UI Clarity */}
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Monthly
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Session
                </span>
              </div>
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between h-36 gap-2 mt-6 border-b border-slate-100 pb-1">
          {data.map((item, index) => {
            const monthlyHeight = Math.max((item.percentage / maxVal) * 100, 5);
            const sessionHeight = Math.max((item.sessionAvg / maxVal) * 100, 5);

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group relative"
              >
                <div className="relative w-full flex justify-center items-end h-full gap-0.5">
                  {/* Monthly Bar (Left) */}
                  <div className="relative flex-1 flex flex-col items-center justify-end h-full max-w-[16px]">
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <span className="bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        M:{item.percentage}%
                      </span>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${monthlyHeight}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={`w-full rounded-t-[2px] ${
                        item.percentage < 75 ? "bg-rose-400" : "bg-indigo-500"
                      }`}
                    />
                  </div>

                  {/* Session Bar (Right) */}
                  <div className="relative flex-1 flex flex-col items-center justify-end h-full max-w-[16px]">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        S:{item.sessionAvg}%
                      </span>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${sessionHeight}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                      className="w-full rounded-t-[2px] bg-emerald-500"
                    />
                  </div>
                </div>

                {/* Month Label */}
                <span className="text-[9px] font-black text-slate-400 uppercase mt-1">
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
