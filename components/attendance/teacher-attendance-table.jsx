"use client";

import { getMonthName } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

// Helper remains the same
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

  // --- STATISTICS CALCULATIONS ---
  // 1. Calculate Daily Totals (Bottom Row)
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
  const totalPossibleManDays = teachers.length * attendanceDocs.length;
  let totalPresentsAcrossSchool = 0;
  dailyPresentCount.forEach((count) => (totalPresentsAcrossSchool += count));
  const schoolStaffingRate =
    totalPossibleManDays > 0
      ? Math.round((totalPresentsAcrossSchool / totalPossibleManDays) * 100)
      : 0;

  return (
    <Card className="border-none shadow-lg print:shadow-none">
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-xs">
            <thead>
              <tr className="bg-slate-800 text-white print:bg-slate-100 print:text-black">
                <th className="border border-slate-300 p-2 text-left">PN</th>
                <th className="border border-slate-300 p-2 text-left min-w-[140px]">
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
                <th className="border border-slate-300 p-2 bg-emerald-600 text-white">
                  P
                </th>
                <th className="border border-slate-300 p-1 bg-rose-600">
                  CURR A
                </th>
                <th className="border border-slate-300 p-1 bg-slate-700">
                  PREV A
                </th>
                <th className="border border-slate-300 p-1 bg-rose-800 font-bold">
                  GT-A
                </th>
                <th className="border border-slate-300 p-2 bg-slate-900 text-white font-bold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                let pCount = 0;
                let aCount = 0;
                const tId = teacher._id.toString();

                let currentMonthAbsents = 0;
                let currentMonthPresents = 0;

                // Calculate current month data
                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[tId];
                  if (status === "Present") currentMonthPresents++;
                  if (status === "Absent") currentMonthAbsents++;
                });

                // Calculate Rolling Totals
                const grandTotalAbsents = teacher.sessionAbsentsTillDate || 0;
                const prevMonthAbsents =
                  grandTotalAbsents - currentMonthAbsents;

                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[tId];
                  if (status === "Present") pCount++;
                  if (status === "Absent") aCount++;
                });

                const total = pCount + aCount;
                const percentage =
                  total > 0 ? Math.round((pCount / total) * 100) : 0;

                // CRITICAL WARNING LOGIC
                const isLowAttendance = total > 5 && percentage < 75;

                return (
                  <tr
                    key={tId}
                    className={`hover:bg-slate-50/50 ${isLowAttendance ? "bg-rose-50/30" : ""}`}
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {teacher.personalNo || "—"}
                    </td>
                    <td
                      className={`border border-slate-200 p-2 font-semibold uppercase ${isLowAttendance ? "text-rose-700" : ""}`}
                    >
                      {teacher.name}
                      {isLowAttendance && (
                        <span className="ml-1 text-[8px] bg-rose-100 text-rose-600 px-1 rounded print:hidden">
                          LOW
                        </span>
                      )}
                    </td>

                    {[...Array(daysInMonth)].map((_, d) => {
                      const status = attendanceMap[d + 1]?.[tId];
                      return (
                        <td
                          key={d}
                          className={`border border-slate-200 text-center font-bold h-8 w-8 ${
                            status === "Absent"
                              ? "text-rose-600 bg-rose-50/20"
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
                      {pCount}
                    </td>
                    {/* CURR A */}
                    <td className="border border-slate-200 text-center font-bold text-rose-600 bg-rose-50/10">
                      {currentMonthAbsents}
                    </td>

                    {/* PREV A (Carried Forward) */}
                    <td className="border border-slate-200 text-center font-medium text-slate-500 bg-slate-50">
                      {prevMonthAbsents > 0 ? prevMonthAbsents : 0}
                    </td>

                    {/* GRAND TOTAL A */}
                    <td className="border border-slate-200 text-center font-black text-rose-800 bg-rose-100/30">
                      {grandTotalAbsents}
                    </td>
                    <td
                      className={`border border-slate-200 text-center font-black ${isLowAttendance ? "text-rose-600 bg-rose-50" : "bg-slate-50"}`}
                    >
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* FOOTER: DAILY TOTALS FOR QUICK ASSUMPTIONS */}
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td
                  colSpan={2}
                  className="border border-slate-300 p-2 text-right uppercase text-[9px]"
                >
                  Staff Present
                </td>
                {dailyPresentCount.map((count, i) => (
                  <td
                    key={i}
                    className={`border border-slate-300 text-center text-[9px] ${
                      count > 0 && count / teachers.length < 0.7
                        ? "bg-amber-100 text-amber-700"
                        : ""
                    }`}
                  >
                    {count > 0 ? count : ""}
                  </td>
                ))}
                <td
                  colSpan={5}
                  className="bg-slate-800 text-white text-center p-1 text-[9px]"
                >
                  Daily Strength
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
}
