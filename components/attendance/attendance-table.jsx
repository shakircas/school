"use client";

import { buildAttendanceMap } from "@/lib/attendance-utils";
import { getMonthName } from "@/lib/constants";
import { Card } from "../ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import { WithdrawalDialog } from "./WithdrawalDialog";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  XCircle,
  Percent,
  Trophy,
  Star,
} from "lucide-react";

export default function AttendanceTable({
  students,
  attendanceDocs,
  daysInMonth,
  month,
  year,
  personKey = "studentId",
  showRoll = true,
  idLabel = "Roll",
  sessionStats,
}) {
  const attendanceMap = buildAttendanceMap(attendanceDocs);
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const HOLIDAYS = ["2026-01-26", "2026-03-23"];

  const getDayInfo = (day, month, year) => {
    const date = new Date(year, month - 1, day);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const isSunday = date.getDay() === 0;
    const isHoliday = HOLIDAYS.includes(dateString);
    return { isSunday: isSunday || isHoliday, label: isHoliday ? "H" : "S" };
  };

  // 1. Calculate Session Stats for Top 5 Students
  const studentsWithStats = students.map((s) => {
    const grandTotalP = s.totalPresentTillDate || 0;
    const grandTotalA = s.totalAbsentTillDate || 0;
    const sTotal = grandTotalP + grandTotalA + (s.totalLeaveTillDate || 0);
    const sPercentage =
      sTotal > 0 ? Math.round((grandTotalP / sTotal) * 100) : 0;
    return { ...s, sPercentage, grandTotalP };
  });

  const topStudents = [...studentsWithStats]
    .sort(
      (a, b) => b.sPercentage - a.sPercentage || b.grandTotalP - a.grandTotalP,
    )
    .slice(0, 5);

  const totalStudents = students.length;
  const totalPresents = students.reduce(
    (acc, s) => acc + (s.totalPresentTillDate || 0),
    0,
  );
  const totalAbsents = students.reduce(
    (acc, s) => acc + (s.totalAbsentTillDate || 0),
    0,
  );

  // Assuming you pass the sessionStats object from the parent component
  const totalPresentsSession = sessionStats?.totalPresent || 0;
  const totalAbsentsSession = sessionStats?.totalAbsent || 0;
  const totalLeaves = sessionStats?.totalLeave || 0;

  return (
    <Card className="border-none shadow-lg print:shadow-none print:border-none space-y-6">
      {/* DASHBOARD SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-0 print:hidden">
        <SummaryCard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Session Presents"
          // value={totalPresents}
          value={totalPresentsSession}
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          title="Session Absents"
          // value={totalAbsents}
          value={totalAbsentsSession}
          icon={<XCircle className="w-4 h-4 text-rose-600" />}
          bgColor="bg-rose-50"
        />
        <SummaryCard
          title="Avg Attendance"
          value={`${totalStudents > 0 ? Math.round((totalPresents / (totalPresents + totalAbsents)) * 100) : 0}%`}
          icon={<Percent className="w-4 h-4 text-amber-600" />}
          bgColor="bg-amber-50"
        />
      </div>

      <div className="p-6 print:p-0">
        {/* PRINT HEADER */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold uppercase underline">
            Official Student Attendance Register
          </h1>
          <p className="text-lg font-semibold">
            {getMonthName(month)} {year}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-xs print:text-[8px]">
            <thead>
              <tr className="bg-emerald-500 text-white print:bg-slate-200 print:text-black">
                <th className="border border-slate-300 p-2 text-left">
                  {idLabel}
                </th>
                <th className="border border-slate-300 p-2 text-left min-w-[150px]">
                  Student Name
                </th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 w-7 text-center font-bold"
                  >
                    {i + 1}
                  </th>
                ))}
                <th className="border border-slate-300 p-1 bg-emerald-500 text-white print:bg-emerald-50 print:text-black">
                  P
                </th>
                <th className="border border-slate-300 p-1 bg-rose-600 text-white print:bg-rose-50 print:text-black">
                  A
                </th>
                <th className="border border-slate-300 p-1 bg-emerald-700 text-white print:bg-slate-50 print:text-black">
                  <span className="text-[8px]">prev</span> P
                </th>
                <th className="border border-slate-300 p-1 bg-rose-600 text-white print:bg-slate-50 print:text-black">
                  <span className="text-[8px]">prev</span> A
                </th>
                <th className="border border-slate-300 p-1 bg-emerald-800 text-white font-bold">
                  <span className="text-[8px]">GT</span>-P
                </th>
                <th className="border border-slate-300 p-1 bg-rose-800 text-white font-bold">
                  <span className="text-[8px]">GT</span>-A
                </th>
                <th className="border border-slate-300 p-2 bg-slate-900 text-white font-bold">
                  % (M)
                </th>
                <th className="border border-slate-300 p-2 bg-slate-900 text-white font-bold">
                  % (S)
                </th>
                <th className="border border-slate-300 p-2 bg-slate-900 text-white print:hidden">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {studentsWithStats.map((s) => {
                let pCount = 0;
                let aCount = 0;
                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[s._id.toString()];
                  if (status === "Present") pCount++;
                  if (status === "Absent") aCount++;
                });

                const mTotal = pCount + aCount;
                const mPercentage =
                  mTotal > 0 ? Math.round((pCount / mTotal) * 100) : 0;
                const isCritical = mPercentage < 75 && mTotal > 5;
                // const isWithdrawn = s.status === "Inactive";

                const consecutiveAbsences = (studentId) => {
                  let count = 0;

                  let maxConsecutive = 0;

                  // Check daily status for the current month

                  for (let d = 1; d <= daysInMonth; d++) {
                    const status = attendanceMap[d]?.[studentId];

                    if (status === "Absent") {
                      count++;

                      maxConsecutive = Math.max(maxConsecutive, count);
                    } else if (status === "Present") {
                      count = 0; // Reset if present
                    }
                  }

                  return maxConsecutive;
                };

                const isWithdrawn = s.status === "Inactive";

                const consecAbs = consecutiveAbsences(s._id);

                // Auto-trigger flag for teacher

                const needsAction = consecAbs >= 6 && !isWithdrawn;

                const withdrawalDate = s.withdrawalDate
                  ? new Date(s.withdrawalDate)
                  : null;

                return (
                  <tr
                    key={s._id}
                    className={`hover:bg-slate-50/50 ${isCritical ? "bg-rose-50/40 print:bg-rose-50" : "bg-white"}`}
                  >
                    <td className="border border-slate-300 p-2 font-medium">
                      {showRoll ? s.rollNumber : s.personalNo || "—"}
                    </td>
                    <td
                      className={`border border-slate-300 p-2 font-semibold uppercase ${isCritical ? "text-rose-700" : ""}`}
                    >
                      <Link
                        href={`/students/${s._id}/report`}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                    </td>
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const { isSunday, label } = getDayInfo(day, month, year);
                      const status = attendanceMap[day]?.[s._id];
                      return (
                        <td
                          key={day}
                          className={`border border-slate-300 text-center font-bold h-8 w-8 print:h-6 print:w-6 ${
                            isSunday
                              ? "bg-slate-100/50 text-slate-400"
                              : status === "Absent"
                                ? "text-rose-600 bg-rose-50/30 print:bg-rose-100"
                                : ""
                          }`}
                        >
                          {isSunday
                            ? label
                            : status === "Present"
                              ? "P"
                              : status === "Absent"
                                ? "A"
                                : status === "Leave"
                                  ? "L"
                                  : "·"}
                        </td>
                      );
                    })}
                    <td className="border border-slate-300 text-center font-bold text-emerald-600">
                      {pCount}
                    </td>
                    <td className="border border-slate-300 text-center font-bold text-rose-600">
                      {aCount}
                    </td>
                    <td className="border border-slate-300 text-center font-medium text-slate-500">
                      {s.totalPresentTillDate - pCount}
                    </td>
                    <td className="border border-slate-300 text-center font-medium text-slate-500">
                      {s.totalAbsentTillDate - aCount}
                    </td>
                    <td className="border border-slate-300 text-center font-black bg-emerald-50">
                      {s.totalPresentTillDate}
                    </td>
                    <td className="border border-slate-300 text-center font-black bg-rose-50">
                      {s.totalAbsentTillDate}
                    </td>
                    <td
                      className={`border border-slate-300 text-center font-black ${isCritical ? "text-rose-600" : ""}`}
                    >
                      {mPercentage}%
                    </td>
                    <td className="border border-slate-300 text-center font-black bg-slate-50">
                      {s.sPercentage}%{" "}
                      {isCritical && (
                        <span className="ml-0.5 text-[8px] print:hidden">
                          ⚠️
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-900 text-center">
                      {needsAction && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 text-[8px]"
                          onClick={() => setWithdrawTarget(s)}
                        >
                          WITHDRAW
                        </Button>
                      )}

                      {isWithdrawn && (
                        <span className="text-rose-500 font-bold text-[10px]">
                          [W]
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOP 5 REGULAR STUDENTS SECTION (NEW) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/30 print:hidden">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3 uppercase">
              <Trophy className="w-4 h-4" /> Top 5 Most Regular Students
            </h3>
            <div className="space-y-2">
              {topStudents.map((s, index) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between bg-white p-2 rounded border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-600 w-4">
                      #{index + 1}
                    </span>
                    <p className="text-xs font-bold uppercase">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      {s.sPercentage}%
                    </span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="flex flex-col justify-end h-full px-4">
            <div className="flex justify-between items-end gap-10">
              <div className="text-center border-t-2 border-slate-900 pt-2 flex-1">
                <p className="text-[10px] font-bold uppercase">Class Teacher</p>
              </div>
              <div className="text-center border-t-2 border-slate-900 pt-2 flex-1">
                <p className="text-[10px] font-bold uppercase">
                  Principal Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Dialog Logic */}

      <WithdrawalDialog
        isOpen={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        student={withdrawTarget}
        onConfirm={async (data) => {
          try {
            const body = {
              status: "Inactive",

              withdrawalDate: data.withdrawalDate,

              withdrawalReason: data.reason,

              notes: data.notes,
            };

            const res = await fetch(`/api/students/${withdrawTarget._id}`, {
              method: "PUT",

              headers: { "Content-Type": "application/json" },

              body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to withdraw student");

            setWithdrawTarget(null);

            window.location.reload();
          } catch (err) {
            alert(err.message);
          }
        }}
      />
    </Card>
  );
}

function SummaryCard({ title, value, icon, bgColor }) {
  return (
    <div
      className={`${bgColor} p-3 rounded-xl border border-slate-200 flex items-center justify-between`}
    >
      <div>
        <p className="text-[10px] font-medium text-slate-500 uppercase">
          {title}
        </p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    </div>
  );
}
