"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttendanceCalendar({ history, month, year }) {
  // 1. Get days in the specific month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)

  // 2. HELPER: Format date as YYYY-MM-DD without timezone shifting
  const formatDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 3. Map history using the safe date key
  const statusMap = {};
  history.forEach((h) => {
    const d = new Date(h.date);
    const dateKey = formatDateKey(d);
    statusMap[dateKey] = h.status;
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getStatusColor = (day) => {
    // Create local date for the calendar cell
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = statusMap[dateKey];

    if (status === "Present") return "bg-emerald-500 text-white";
    if (status === "Absent") return "bg-rose-500 text-white";
    if (status === "Leave") return "bg-amber-500 text-white";
    if (status === "Late") return "bg-blue-500 text-white";
    if (status === "Half Day") return "bg-purple-500 text-white";

    return "bg-slate-50 text-slate-300"; // Default
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <Card className="border-none shadow-sm print:shadow-none print:border h-full">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-sm font-black uppercase tracking-widest flex justify-between">
          <span>
            {monthName} {year}
          </span>
          <span className="text-[10px] text-slate-400 font-medium italic">
            Monthly Grid
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <span key={d} className="text-[10px] font-bold text-slate-400">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((b) => (
            <div key={`b-${b}`} />
          ))}
          {days.map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-md transition-colors ${getStatusColor(day)}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Legend for Parents */}
        <div className="mt-6 pt-4 border-t border-dashed space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Legend
          </p>
          <div className="grid grid-cols-2 gap-y-2">
            <LegendItem
              color="bg-emerald-500"
              label="Present"
              desc="In school"
            />
            <LegendItem color="bg-rose-500" label="Absent" desc="Uninformed" />
            <LegendItem color="bg-amber-500" label="Leave" desc="Approved" />
            <LegendItem color="bg-blue-500" label="Late" desc="After start" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ color, label, desc }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-sm ${color} shrink-0`} />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-bold text-slate-700 uppercase">
          {label}
        </span>
        <span className="text-[8px] text-slate-400">{desc}</span>
      </div>
    </div>
  );
}
