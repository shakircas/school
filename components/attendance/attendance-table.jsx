// "use client";

// import { buildAttendanceMap } from "@/lib/attendance-utils";
// import { getMonthName } from "@/lib/constants";
// import { Card } from "../ui/card";
// import { useState } from "react";
// import { Button } from "../ui/button";
// import { WithdrawalDialog } from "./WithdrawalDialog";
// import Link from "next/link";

// export default function AttendanceTable({
//   students,
//   attendanceDocs,
//   daysInMonth,
//   month,
//   year,
//   personKey = "studentId",
//   showRoll = true,
//   idLabel = "Roll",
// }) {
//   const attendanceMap = buildAttendanceMap(attendanceDocs);

//   const [withdrawTarget, setWithdrawTarget] = useState(null);

//   // const getDayInfo = (day, month, year) => {
//   //   const date = new Date(year, month - 1, day);
//   //   const isSunday = date.getDay() === 0; // 0 is Sunday
//   //   return { isSunday };
//   // };

//   const HOLIDAYS = ["2026-01-26", "2026-03-23"]; // Example: Republic Day, Pakistan Day

//   const getDayInfo = (day, month, year) => {
//     const date = new Date(year, month - 1, day);
//     const dateString = date.toISOString().split("T")[0];

//     const isSunday = date.getDay() === 0;
//     const isHoliday = HOLIDAYS.includes(dateString);

//     return { isWeekend: isSunday || isHoliday, label: isHoliday ? "H" : "" };
//   };
//   return (
//     <Card className="border-none shadow-lg print:shadow-none print:border-none">
//       <div className="p-6 print:p-0">
//         {/* PRINT HEADER */}
//         <div className="hidden print:block text-center mb-6">
//           <h1 className="text-2xl font-bold uppercase">
//             Official {showRoll ? "Student" : "Staff"} Attendance Register
//           </h1>
//           <p className="text-lg">
//             {getMonthName(month)} {year}
//           </p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-[10px] sm:text-xs">
//             <thead>
//               <tr className="bg-slate-50 print:bg-transparent">
//                 <th className="border border-slate-300 p-2 text-left">
//                   {idLabel}
//                 </th>
//                 <th className="border border-slate-300 p-2 text-left min-w-[150px]">
//                   {showRoll ? "Student Name" : "Teacher Name"}
//                 </th>
//                 {/* Day Columns */}

//                 {Array.from({ length: daysInMonth }, (_, i) => {
//                   const day = i + 1;
//                   const { isSunday } = getDayInfo(day, month, year);

//                   return (
//                     <th
//                       key={day}
//                       className={`p-2 text-center border text-[10px] font-bold ${
//                         isSunday
//                           ? "bg-rose-50 text-rose-600 print:bg-rose-50"
//                           : "bg-slate-50"
//                       }`}
//                     >
//                       {day}
//                     </th>
//                   );
//                 })}
//                 {/* Summary Headers */}
//                 {/* Summary Headers - Optimized for spacing */}
//                 <th className="border border-slate-300 p-1 bg-indigo-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
//                   CURR
//                   <br />
//                   PRES
//                 </th>
//                 <th className="border border-slate-300 p-1 bg-rose-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
//                   CURR
//                   <br />
//                   ABS
//                 </th>
//                 <th className="border border-slate-300 p-1 bg-amber-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
//                   PREV
//                   <br />
//                   PRES
//                 </th>
//                 <th className="border border-slate-300 p-1 bg-emerald-50 print:bg-transparent text-[10px] min-w-[45px] font-bold leading-tight">
//                   GRAND
//                   <br />
//                   TOTAL
//                 </th>
//                 <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold min-w-[40px]">
//                   %
//                 </th>
//                 {/* <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold">
//                   %
//                 </th> */}
//                 <th className="border border-slate-300 p-2 bg-slate-50 print:hidden min-w-[80px]">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((s) => {
//                 // 1. Calculate current month totals locally from the attendance docs
//                 let pCount = 0;
//                 let aCount = 0;

//                 [...Array(daysInMonth)].forEach((_, d) => {
//                   const status = attendanceMap[d + 1]?.[s._id.toString()];
//                   if (status === "Present") pCount++;
//                   if (status === "Absent") aCount++;
//                 });

//                 // 2. Derive Cumulative Totals
//                 // Ensure the property name "totalPresentTillDate" matches your API response
//                 // const grandTotal = s.totalPresentTillDate || 0;
//                 // const prevP = grandTotal - pCount;

//                 // // 3. Percentage calculation (Monthly)
//                 // const totalDays = pCount + aCount;
//                 // const percentage =
//                 //   totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
//                 // 2. Derive Cumulative Totals Safely
//                 const grandTotal = s.totalPresentTillDate || 0;
//                 // Prev Month = Grand Total (including this month) minus what they earned this month
//                 const prevP = Math.max(0, grandTotal - pCount);

//                 // 3. Percentage calculation (Current Month)
//                 const totalDays = pCount + aCount;
//                 const percentage =
//                   totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
//                 const isCritical = percentage < 75 && totalDays > 5;

//                 const consecutiveAbsences = (studentId) => {
//                   let count = 0;
//                   let maxConsecutive = 0;
//                   // Check daily status for the current month
//                   for (let d = 1; d <= daysInMonth; d++) {
//                     const status = attendanceMap[d]?.[studentId];
//                     if (status === "Absent") {
//                       count++;
//                       maxConsecutive = Math.max(maxConsecutive, count);
//                     } else if (status === "Present") {
//                       count = 0; // Reset if present
//                     }
//                   }
//                   return maxConsecutive;
//                 };

//                 const isWithdrawn = s.status === "Inactive";
//                 const consecAbs = consecutiveAbsences(s._id);

//                 // Auto-trigger flag for teacher
//                 const needsAction = consecAbs >= 6 && !isWithdrawn;
//                 const withdrawalDate = s.withdrawalDate
//                   ? new Date(s.withdrawalDate)
//                   : null;
//                 // Inside the daysArray.map((day) => { ... })
//                 // const currentDate = new Date(year, month - 1, day);
//                 // const isPostWithdrawal =
//                 //   isWithdrawn && withdrawalDate && currentDate > withdrawalDate;

//                 return (
//                   <tr
//                     key={s._id}
//                     className={`${isCritical ? "bg-rose-50/40" : "hover:bg-slate-50/50"} transition-colors`}
//                   >
//                     <td className="border border-slate-200 p-2 font-medium">
//                       {showRoll ? s.rollNumber : s.personalNo || "—"}
//                     </td>
//                     <Link
//                       href={`/students/${s._id}/report`}
//                       className="hover:underline cursor-pointer"
//                     >
//                       <td className="border border-slate-200 p-2 font-semibold uppercase whitespace-nowrap">
//                         {s.name}
//                       </td>
//                     </Link>

//                     {/* Daily Presence Grid */}
//                     {/* {[...Array(daysInMonth)].map((_, d) => {
//                       const status = attendanceMap[d + 1]?.[s._id.toString()];
//                       return (
//                         <td
//                           key={d}
//                           className={`border border-slate-200 text-center font-bold h-7 w-7 ${
//                             status === "Absent"
//                               ? "text-rose-600 bg-rose-50/20 print:text-black"
//                               : ""
//                           }`}
//                         >
//                           {status === "Present"
//                             ? "P"
//                             : status === "Absent"
//                               ? "A"
//                               : "·"}
//                         </td>
//                       );
//                     })} */}

//                     {[...Array(daysInMonth)].map((_, i) => {
//                       const day = i + 1;
//                       // Get date info to identify Sundays

//                       const { isSunday } = getDayInfo(day, month, year);
//                       const status = attendanceMap[day]?.[s._id];

//                       return (
//                         <td
//                           key={day}
//                           className={`border border-slate-200 text-center font-bold h-7 w-7 text-[10px] ${
//                             isSunday
//                               ? "bg-slate-100/50 print:bg-slate-50" // Shading for Sundays
//                               : status === "Absent"
//                                 ? "text-rose-600 bg-rose-50/20 print:text-black"
//                                 : status === "Leave"
//                                   ? "text-amber-600 bg-amber-50/20"
//                                   : ""
//                           }`}
//                         >
//                           {isSunday ? (
//                             <span className="bg-white text-[8px] text-slate-400 opacity-90">
//                               S
//                             </span>
//                           ) : status === "Present" ? (
//                             "P"
//                           ) : status === "Absent" ? (
//                             "A"
//                           ) : status === "Leave" ? (
//                             "L"
//                           ) : (
//                             "·"
//                           )}
//                         </td>
//                       );
//                     })}

//                     {/* Monthly Summary */}
//                     <td className="border border-slate-200 text-center font-bold text-indigo-600 print:text-black">
//                       {pCount}
//                     </td>
//                     <td className="border border-slate-200 text-center font-bold text-rose-500 print:text-black">
//                       {aCount}
//                     </td>

//                     {/* PREV PRES - Calculated via subtraction */}
//                     <td className="border border-slate-200 text-center font-medium text-slate-500 bg-amber-50/20 print:bg-transparent">
//                       {prevP > 0 ? prevP : 0}
//                     </td>

//                     {/* GRAND TOTAL - Fetched from DB */}
//                     <td className="border border-slate-200 text-center font-black text-emerald-700 bg-emerald-50/40 print:bg-transparent">
//                       {grandTotal}
//                     </td>

//                     {/* Monthly Percentage */}
//                     <td
//                       className={`border border-slate-200 text-center font-black ${isCritical ? "text-rose-600" : "bg-slate-50 print:bg-transparent"}`}
//                     >
//                       {percentage}%
//                       {isCritical && (
//                         <span className="ml-0.5 text-[8px] print:hidden">
//                           ⚠️
//                         </span>
//                       )}
//                     </td>

//                     <td>
//                       {needsAction && (
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           className="h-6 text-[8px]"
//                           onClick={() => setWithdrawTarget(s)}
//                         >
//                           WITHDRAW
//                         </Button>
//                       )}

//                       {isWithdrawn && (
//                         <span className="text-rose-500 font-bold text-[10px]">
//                           [W]
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           {/* Withdrawal Dialog Logic */}
//           <WithdrawalDialog
//             isOpen={!!withdrawTarget}
//             onClose={() => setWithdrawTarget(null)}
//             student={withdrawTarget}
//             onConfirm={async (data) => {
//               try {
//                 // Use the logic from your WithdrawalsContent.jsx
//                 const body = {
//                   status: "Inactive", // Backend uses Inactive based on your code
//                   withdrawalDate: data.withdrawalDate,
//                   withdrawalReason: data.reason,
//                   notes: data.notes,
//                 };

//                 const res = await fetch(`/api/students/${withdrawTarget._id}`, {
//                   method: "PUT", // Your reference uses PUT
//                   headers: { "Content-Type": "application/json" },
//                   body: JSON.stringify(body),
//                 });

//                 if (!res.ok) throw new Error("Failed to withdraw student");

//                 // Success handling
//                 setWithdrawTarget(null);
//                 window.location.reload(); // Refresh to update the table
//               } catch (err) {
//                 alert(err.message);
//               }
//             }}
//           />
//         </div>

//         {/* SIGNATURE SECTION */}
//         <div className="mt-12 flex justify-between items-end px-4">
//           <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
//             <p className="text-[10px] font-bold uppercase">
//               {showRoll ? "Class Teacher" : "Head of Department"}
//             </p>
//           </div>
//           <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
//             <p className="text-[10px] font-bold uppercase">
//               Principal / Authorized Signatory
//             </p>
//           </div>
//         </div>
//       </div>
//       <style jsx global>{`
//         @media print {
//           @page {
//             size: landscape;
//             margin: 1cm;
//           }
//           nav,
//           button,
//           header,
//           .print\:hidden {
//             display: none !important;
//           }
//           table {
//             width: 100% !important;
//             border-collapse: collapse !important;
//           }
//           th,
//           td {
//             border: 1px solid #000 !important;
//             color: #000 !important;
//             padding: 4px !important;
//           }
//         }
//       `}</style>
//     </Card>
//   );
// }

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
          value={totalPresents}
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          title="Session Absents"
          value={totalAbsents}
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
