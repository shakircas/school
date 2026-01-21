"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Download } from "lucide-react";

export default function AttendanceTrendChart({ data = [], label = "Staff" }) {
  // Logic to export data to Excel (CSV)
  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    const headers = ["Month", "Attendance Percentage"];
    const rows = data.map((item) => `${item.month},${item.percentage}%`);
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${label}_Attendance_Trend_${new Date().getFullYear()}.csv`
    );
    link.click();
  };

  if (!data || data.length < 0) {
    return (
      <Card className="border-none shadow-sm bg-white h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <BarChart2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter text-slate-400">
            Trend data appearing soon...
          </p>
        </div>
      </Card>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.percentage || 0), 80);
  const currentMonth = data[data?.length - 1];
  const prevMonth = data[data?.length - 2];
  const difference = currentMonth?.percentage - prevMonth?.percentage;

  return (
    <Card className="print:hidden border-none shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              6-Month {label} Trend
            </CardTitle>
            <div
              className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
                difference >= 0
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-rose-600 bg-rose-50"
              }`}
            >
              {difference >= 0 ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {Math.abs(difference)}% from last month
            </div>
          </div>

          {/* New Download Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
            onClick={exportToExcel}
            title="Download Excel Report"
          >
            <Download size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between h-32 gap-2 mt-2">
          {data.map((item, index) => {
            const heightPercentage = (item.percentage / maxVal) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="relative w-full flex justify-center items-end h-full">
                  <div className="absolute -top-7 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.percentage}%
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`w-full max-w-[30px] rounded-t-sm ${
                      item.percentage < 75 ? "bg-rose-400" : "bg-indigo-500"
                    }`}
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
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
