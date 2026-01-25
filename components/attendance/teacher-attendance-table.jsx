"use client";

import { getMonthName } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

function buildAttendanceMap(attendanceDocs) {
  const map = {};
  attendanceDocs.forEach((doc) => {
    const day = new Date(doc.date).getDate();
    if (!map[day]) map[day] = {};
    doc.records.forEach((record) => {
      const source = record.personId || record.teacherId || record.studentId;
      if (source) {
        const idString =
          typeof source === "object" && source._id
            ? source._id.toString()
            : source.toString();
        map[day][idString] = record.status;
      }
    });
  });
  return map;
}

export default function TeacherAttendanceTable({
  teachers,
  attendanceDocs,
  daysInMonth,
  month,
  year,
}) {
  const attendanceMap = buildAttendanceMap(attendanceDocs);

  const LEAVE_THRESHOLD = 25;

  // 1. Calculate Daily Totals for Footer
  const dailyPresentCount = Array(daysInMonth)
    .fill(0)
    .map((_, d) => {
      let count = 0;
      teachers.forEach((t) => {
        if (attendanceMap[d + 1]?.[t._id.toString()] === "Present") count++;
      });
      return count;
    });

  // 2. Aggregate School-wide Stats
  // We use attendanceDocs.length as the number of days marked to get an accurate rate
  const totalPossibleManDays = teachers.length * (attendanceDocs.length || 1);
  let totalPresentsAcrossSchool = 0;
  dailyPresentCount.forEach((count) => (totalPresentsAcrossSchool += count));
  const schoolStaffingRate =
    totalPossibleManDays > 0
      ? Math.round((totalPresentsAcrossSchool / totalPossibleManDays) * 100)
      : 0;

  return (
    <Card className="border-none shadow-lg print:shadow-none print:border-none">
      <div className="p-6 print:p-0">
        {/* TOP ANALYTICS BAR (Screen Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
            <Users className="text-indigo-600 h-5 w-5" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Staffing Rate
              </p>
              <p className="text-lg font-black">{schoolStaffingRate}%</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 h-5 w-5" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Avg Daily Presence
              </p>
              <p className="text-lg font-black">
                {(
                  totalPresentsAcrossSchool / (attendanceDocs.length || 1)
                ).toFixed(1)}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
            <AlertTriangle className="text-amber-600 h-5 w-5" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Critical Days
              </p>
              <p className="text-lg font-black">
                {
                  dailyPresentCount.filter(
                    (c) => c > 0 && c / teachers.length < 0.7
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-[10px] sm:text-xs print:text-[8px]">
            <thead>
              <tr className="bg-primary text-white print:bg-slate-200 print:text-black">
                <th className="border border-slate-300 p-2 text-left">PN</th>
                <th className="border border-slate-300 p-2 text-left min-w-[120px]">
                  Teacher Name
                </th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 w-7 text-center"
                  >
                    {i + 1}
                  </th>
                ))}
                <th className="border border-slate-300 p-1 bg-emerald-600 text-white print:bg-emerald-100 print:text-emerald-900">
                  P
                </th>
                <th className="border border-slate-300 p-1 bg-rose-600 text-white print:bg-rose-100 print:text-rose-900">
                  CURR A
                </th>
                <th className="border border-slate-300 p-1 bg-slate-700 text-white print:bg-slate-100 print:text-slate-900">
                  PREV A
                </th>
                <th className="border border-slate-300 p-1 bg-rose-800 text-white font-bold print:bg-rose-200 print:text-rose-950">
                  GT-A
                </th>
                
                <th className="border border-slate-300 p-2 bg-primary text-white font-bold print:bg-slate-200 print:text-black">
                Status
                </th>
                <th className="border border-slate-300 p-2 bg-primary text-white font-bold print:bg-slate-200 print:text-black">
                  %
                </th>
                <th className="border border-slate-300 p-2 bg-primary text-white font-bold print:bg-slate-200 print:text-black">
                  Balance
                </th>

              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                const tId = teacher._id.toString();
                let currentMonthPresents = 0;
                let currentMonthAbsents = 0;

                // Single pass to calculate monthly stats
                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[tId];
                  if (status === "Present") currentMonthPresents++;
                  if (status === "Absent") currentMonthAbsents++;
                });

                const grandTotalAbsents = teacher.sessionAbsentsTillDate || 0;
                const prevMonthAbsents =
                  grandTotalAbsents - currentMonthAbsents;
                const totalDaysMarked =
                  currentMonthPresents + currentMonthAbsents;
                const percentage =
                  totalDaysMarked > 0
                    ? Math.round((currentMonthPresents / totalDaysMarked) * 100)
                    : 0;
                

                // Logic thresholds
                
                const isCritical = grandTotalAbsents >= LEAVE_THRESHOLD;
                const isLowAttendance = totalDaysMarked > 5 && percentage < 75;
                const balance = LEAVE_THRESHOLD - grandTotalAbsents;

                // const isCritical = balance <= 0;
                const isWarning = balance <= 5 && balance > 0;

                return (
                  <tr
                    key={tId}
                    className={`hover:bg-slate-50/50 ${isCritical ? "bg-rose-50/40 print:bg-rose-50" : ""}`}
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {teacher.personalNo || "—"}
                    </td>
                    <td
                      className={`border border-slate-200 p-2 font-semibold uppercase ${isLowAttendance ? "text-rose-700" : ""}`}
                    >
                      {teacher.name}
                      {isLowAttendance && (
                        <span className="ml-1 text-[7px] bg-rose-100 text-rose-700 px-1 rounded border border-rose-200 print:inline-block">
                          LOW
                        </span>
                      )}
                    </td>

                    {[...Array(daysInMonth)].map((_, d) => {
                      const status = attendanceMap[d + 1]?.[tId];
                      return (
                        <td
                          key={d}
                          className={`border border-slate-200 text-center font-bold h-8 w-8 print:h-6 print:w-6 ${
                            status === "Absent"
                              ? "text-rose-600 bg-rose-50/30 print:bg-rose-100"
                              : status === "Present"
                                ? "text-emerald-600"
                                : ""
                          }`}
                        >
                          {status === "Present"
                            ? "P"
                            : status === "Absent"
                              ? "A"
                              : ""}
                        </td>
                      );
                    })}

                    <td className="border border-slate-200 text-center font-bold text-emerald-600">
                      {currentMonthPresents}
                    </td>
                    <td className="border border-slate-200 text-center font-bold text-rose-600 bg-rose-50/20 print:bg-rose-50">
                      {currentMonthAbsents}
                    </td>
                    <td className="border border-slate-200 text-center font-medium text-slate-500 bg-slate-50/50 print:bg-slate-50">
                      {prevMonthAbsents > 0 ? prevMonthAbsents : 0}
                    </td>

                    {/* GT-A Column with conditional Print classes */}
                    <td
                      className={`border border-slate-300 text-center font-black ${
                        isCritical
                          ? "bg-rose-600 text-white print:bg-rose-700 print:text-white"
                          : "bg-slate-100 text-slate-900 print:bg-slate-100"
                      }`}
                    >
                      {grandTotalAbsents}
                    </td>

                    <td className="border border-slate-300 p-1 text-[8px] font-bold">
                      <span
                        className={`px-1 py-0.5 rounded-full block text-center truncate w-full border ${
                          isCritical
                            ? "bg-rose-100 text-rose-700 border-rose-300"
                            : grandTotalAbsents > 15
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : "bg-emerald-100 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        {isCritical
                          ? "EXCEEDED"
                          : grandTotalAbsents > 15
                            ? "WARNING"
                            : "OK"}
                      </span>
                    </td>
                    <td
                      className={`border border-slate-200 text-center font-black ${isLowAttendance ? "text-rose-600 bg-rose-50" : "bg-slate-50"}`}
                    >
                      {percentage}%
                    </td>
                    {/* BALANCE COLUMN */}
                    <td
                      className={`border border-slate-300 text-center font-black ${
                        isCritical
                          ? "bg-rose-600 text-white"
                          : isWarning
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {balance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 print:bg-slate-100">
                <td
                  colSpan={2}
                  className="border border-slate-300 p-2 text-right uppercase text-[9px]"
                >
                  Staff Present
                </td>
                {dailyPresentCount.map((count, i) => (
                  <td
                    key={i}
                    className={`border border-slate-300 text-center text-[9px] ${count > 0 && count / teachers.length < 0.7 ? "bg-amber-100 text-amber-700 print:bg-amber-100" : ""}`}
                  >
                    {count > 0 ? count : ""}
                  </td>
                ))}
                <td
                  colSpan={8}
                  className="bg-primary text-white text-center p-1 text-[9px] print:bg-slate-200 print:text-black"
                >
                  Daily Strength
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* HR REMARKS SECTION */}
        <div className="mt-4 p-4 bg-primary text-white rounded-lg flex justify-between items-center print:bg-white print:text-black print:border-2">
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] uppercase opacity-60">Session Limit</p>
              <p className="text-xl font-black">{LEAVE_THRESHOLD}</p>
            </div>
            <div className="text-center border-l border-slate-700 pl-8">
              <p className="text-[10px] uppercase opacity-60">Over-Limit Staff</p>
              <p className="text-xl font-black text-rose-400">
                {teachers.filter((t) => (t.sessionAbsentsTillDate || 0) > LEAVE_THRESHOLD).length}
              </p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-blue-300 uppercase">System Note</p>
             <p className="text-[9px] italic opacity-70">BAL (Balance) = {LEAVE_THRESHOLD} - GT-A. Negative balance indicates salary deduction eligibility.</p>
          </div>
        </div>
     

        {/* SUMMARY FOOTER */}
        <div className="mt-4 p-4 bg-primary text-white rounded-lg flex justify-between items-center print:bg-white print:text-black print:border-2 print:border-slate-900 print:rounded-none">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[10px] uppercase opacity-60">Total Staff</p>
              <p className="text-xl font-black">{teachers.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase opacity-60">
                Critical Staff Count
              </p>
              <p className="text-xl font-black text-rose-400 print:text-rose-700">
                {
                  teachers.filter((t) => (t.sessionAbsentsTillDate || 0) >= 20)
                    .length
                }
              </p>
            </div>
          </div>
          <p className="text-[10px] italic opacity-70 max-w-[300px] text-right print:opacity-100 print:text-black">
            * Critical Staff Count indicates employees who have exceeded the
            20-day session absence threshold.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            border: 1px solid #000 !important;
          }
          th,
          td {
            border: 1px solid #666 !important;
          }
          /* Ensure critical rows are highlighted even in PDF */
          .print\:bg-rose-50 {
            background-color: #fff1f2 !important;
          }
          .print\:bg-rose-700 {
            background-color: #be123c !important;
          }
          .print\:text-white {
            color: #ffffff !important;
          }
        }
      `}</style>
    </Card>
  );
}
