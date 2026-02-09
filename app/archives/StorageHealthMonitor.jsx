"use client";

import { AlertTriangle, HardDrive, Info } from "lucide-react";

export function StorageHealthMonitor({ totalSize, limitMB = 500 }) {
  const usedPercentage = (totalSize / limitMB) * 100;

  // Determine status color
  const isCritical = usedPercentage > 85;
  const isWarning = usedPercentage > 60;

  const statusColor = isCritical
    ? "bg-red-500"
    : isWarning
      ? "bg-amber-500"
      : "bg-green-500";
  const textColor = isCritical
    ? "text-red-700"
    : isWarning
      ? "text-amber-700"
      : "text-green-700";
  const borderColor = isCritical
    ? "border-red-200"
    : isWarning
      ? "border-amber-200"
      : "border-green-200";
  const bgColor = isCritical
    ? "bg-red-50"
    : isWarning
      ? "bg-amber-50"
      : "bg-green-50";

  return (
    <div
      className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-500`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <HardDrive size={16} className={textColor} />
          <span className={textColor}>System Storage Health</span>
        </div>
        <span className={`text-xs font-black ${textColor}`}>
          {usedPercentage.toFixed(1)}% Used
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${statusColor}`}
          style={{ width: `${Math.min(usedPercentage, 100)}%` }}
        />
      </div>

      {/* Alert Messaging */}
      {isWarning && (
        <div className="flex gap-2 items-start animate-pulse">
          <AlertTriangle size={14} className={`${textColor} mt-0.5 shrink-0`} />
          <p className={`text-[11px] leading-tight font-medium ${textColor}`}>
            {isCritical
              ? "CRITICAL: Storage almost full. Consider purging archives older than 5 years immediately."
              : "WARNING: Archive growth is significant. Monitor your database usage closely."}
          </p>
        </div>
      )}

      {!isWarning && (
        <div className="flex gap-2 items-center">
          <Info size={14} className="text-green-600" />
          <p className="text-[11px] text-green-700 font-medium">
            Database health is optimal. Plenty of overhead for current year
            operations.
          </p>
        </div>
      )}
    </div>
  );
}
