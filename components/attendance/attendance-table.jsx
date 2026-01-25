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

  const HOLIDAYS = ["2026-01-26", "2026-03-23"]; // Example: Republic Day, Pakistan Day

  const getDayInfo = (day, month, year) => {
    const date = new Date(year, month - 1, day);

    // Safely format YYYY-MM-DD in local time to avoid ISO timezone shifts
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateString = `${y}-${m}-${d}`;

    const isSunday = date.getDay() === 0;
    const isHoliday = HOLIDAYS.includes(dateString);

    // Return isSunday explicitly so the existing JSX logic works without further changes
    return { isSunday: isSunday || isHoliday, label: isHoliday ? "H" : "" };
  };

  return (
    <Card className="border-none shadow-lg print:shadow-none print:border-none">
      <div className="p-6 print:p-0">
        {/* PRINT HEADER */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold uppercase">
            Official {showRoll ? "Student" : "Staff"} Attendance Register
          </h1>
          <p className="text-lg">
            {getMonthName(month)} {year}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-xs">
            <thead>
              <tr className="bg-slate-50 print:bg-transparent">
                <th className="border border-slate-300 p-2 text-left">
                  {idLabel}
                </th>
                <th className="border border-slate-300 p-2 text-left min-w-[150px]">
                  {showRoll ? "Student Name" : "Teacher Name"}
                </th>
                {/* Day Columns */}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const { isSunday, label } = getDayInfo(day, month, year);

                  return (
                    <th
                      key={day}
                      className={`p-2 text-center border text-[10px] font-bold ${
                        isSunday
                          ? "bg-rose-50 text-rose-600 print:bg-rose-50"
                          : "bg-slate-50"
                      }`}
                    >
                      {label || day}
                    </th>
                  );
                })}
                {/* Summary Headers */}
                {/* Summary Headers - Optimized for spacing */}
                <th className="border border-slate-300 p-1 bg-indigo-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
                  CURR
                  <br />
                  PRES
                </th>
                <th className="border border-slate-300 p-1 bg-rose-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
                  CURR
                  <br />
                  ABS
                </th>
                <th className="border border-slate-300 p-1 bg-amber-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
                  PREV
                  <br />
                  PRES
                </th>
                <th className="border border-slate-300 p-1 bg-emerald-50/50 print:bg-transparent text-[9px] min-w-[35px] leading-tight">
                  PREV
                  <br />
                  ABS
                </th>

                <th className="border border-slate-300 p-1 bg-emerald-50 print:bg-transparent text-[10px] min-w-[45px] font-bold leading-tight">
                  GRAND
                  <br />
                  TOTAL
                </th>
                <th className="border border-slate-300 p-1 bg-emerald-50 print:bg-transparent text-[10px] min-w-[45px] font-bold leading-tight">
                  GRAND A
                  <br />
                  TOTAL
                </th>



                <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold min-w-[40px]">
                  %
                </th>
                {/* <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold">
                  %
                </th> */}
                <th className="border border-slate-300 p-2 bg-slate-50 print:hidden min-w-[80px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                // 1. Calculate current month totals locally from the attendance docs
                let pCount = 0;
                let aCount = 0;

                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[s._id.toString()];
                  if (status === "Present") pCount++;
                  if (status === "Absent") aCount++;
                });

                // 2. Derive Cumulative Totals Safely
                const grandTotal = s.totalPresentTillDate || 0;
                const grandTotalAbsent = s.totalAbsentTillDate || 0;
                // Prev Month = Grand Total (including this month) minus what they earned this month
                const prevP = Math.max(0, grandTotal - pCount);
                const prevA = Math.max(0, grandTotalAbsent - aCount);


                // 3. Percentage calculation (Current Month)
                const totalDays = pCount + aCount;
                const percentage =
                  totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
                const isCritical = percentage < 75 && totalDays > 5;

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
                    className={`${isCritical ? "bg-rose-50/40" : "hover:bg-slate-50/50"} transition-colors`}
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {showRoll ? s.rollNumber : s.personalNo || "—"}
                    </td>
                    <Link
                      href={`/students/${s._id}/report`}
                      className="hover:underline cursor-pointer"
                    >
                      <td className="border border-slate-200 p-2 font-semibold uppercase whitespace-nowrap">
                        {s.name}
                      </td>
                    </Link>

                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const { isSunday, label } = getDayInfo(day, month, year);
                      const status = attendanceMap[day]?.[s._id];

                      return (
                        <td
                          key={day}
                          className={`border border-slate-200 text-center font-bold h-7 w-7 text-[10px] ${
                            isSunday
                              ? "bg-slate-100/50 print:bg-slate-50" // Shading for Sundays/Holidays
                              : status === "Absent"
                                ? "text-rose-600 bg-rose-50/20 print:text-black"
                                : status === "Leave"
                                  ? "text-amber-600 bg-amber-50/20"
                                  : ""
                          }`}
                        >
                          {isSunday ? (
                            <span className="bg-white text-[8px] text-slate-400 opacity-90">
                              {label || "S"}
                            </span>
                          ) : status === "Present" ? (
                            "P"
                          ) : status === "Absent" ? (
                            "A"
                          ) : status === "Leave" ? (
                            "L"
                          ) : (
                            "·"
                          )}
                        </td>
                      );
                    })}

                    {/* Monthly Summary */}
                    <td className="border border-slate-200 text-center font-bold text-indigo-600 print:text-black">
                      {pCount}
                    </td>
                    <td className="border border-slate-200 text-center font-bold text-rose-500 print:text-black">
                      {aCount}
                    </td>

                    {/* PREV PRES - Calculated via subtraction */}
                    <td className="border border-slate-200 text-center font-medium text-slate-500 bg-amber-50/20 print:bg-transparent">
                      {prevP > 0 ? prevP : 0}
                    </td>

                    {/* PREV ABS - Calculated via subtraction */}
                    <td className="border border-slate-200 text-center font-medium text-slate-500 bg-rose-50/20 print:bg-transparent">
                      {prevA > 0 ? prevA : 0}
                    </td>

                    {/* GRAND TOTAL - Fetched from DB */}
                    <td className="border border-slate-200 text-center font-black text-emerald-700 bg-emerald-50/40 print:bg-transparent">
                      {grandTotal}
                    </td>

                    {/* GRAND TOTAL - Fetched from DB */}
                    <td className="border border-slate-200 text-center font-black text-rose-600 bg-rose-50/20 print:bg-transparent">
                      {grandTotalAbsent}
                    </td>

                    {/* Monthly Percentage */}
                    <td
                      className={`border border-slate-200 text-center font-black ${isCritical ? "text-rose-600" : "bg-slate-50 print:bg-transparent"}`}
                    >
                      {percentage}%
                      {isCritical && (
                        <span className="ml-0.5 text-[8px] print:hidden">
                          ⚠️
                        </span>
                      )}
                    </td>

                    <td>
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
        </div>

        {/* SIGNATURE SECTION */}
        <div className="mt-12 flex justify-between items-end px-4">
          <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase">
              {showRoll ? "Class Teacher" : "Head of Department"}
            </p>
          </div>
          <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
            <p className="text-[10px] font-bold uppercase">
              Principal / Authorized Signatory
            </p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          nav,
          button,
          header,
          .print\:hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            border: 1px solid #000 !important;
            color: #000 !important;
            padding: 4px !important;
          }
        }
      `}</style>
    </Card>
  );
}