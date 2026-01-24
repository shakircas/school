"use client";

export default function AttendanceCircle({ reportData }) {
  // Calculate Totals
  const totals = reportData && reportData?.reduce(
    (acc, curr) => ({
      presents: acc.presents + curr.presents,
      total: acc.total + curr.totalDays,
    }),
    { presents: 0, total: 0 }
  );

  const percentage =
    totals.total > 0 ? Math.round((totals.presents / totals.total) * 100) : 0;

  // SVG Circle Logic
  const strokeWidth = 12;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on performance
  const getColor = (pct) => {
    if (pct >= 85) return "#10b981"; // Emerald
    if (pct >= 75) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-4">
        Session Attendance
      </h3>
      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-slate-800">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Overall
          </span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center">
        <div>
          <p className="text-lg font-bold text-slate-700">{totals.presents}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Presents
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-700">{totals.total}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Total Days
          </p>
        </div>
      </div>
    </div>
  );
}
