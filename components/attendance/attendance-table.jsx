// import { buildAttendanceMap } from "@/lib/attendance-utils";
// import { getMonthName } from "@/lib/constants";
// import { Card } from "../ui/card";

// export default function AttendanceTable({
//   students, // This acts as the list for both Students or Teachers
//   attendanceDocs,
//   daysInMonth,
//   month,
//   year,
//   personKey = "studentId", // Default key for attendance mapping
//   showRoll = true, // Toggle between Roll No and Personal No
//   idLabel = "Roll", // The header label
// }) {
//   const attendanceMap = buildAttendanceMap(attendanceDocs);

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
//                 {/* Dynamic ID Label */}
//                 <th className="border border-slate-300 p-2 text-left">
//                   {idLabel}
//                 </th>
//                 <th className="border border-slate-300 p-2 text-left min-w-[150px]">
//                   {showRoll ? "Student Name" : "Teacher Name"}
//                 </th>
//                 {[...Array(daysInMonth)].map((_, i) => (
//                   <th
//                     key={i}
//                     className="border border-slate-300 w-6 text-center bg-slate-100/50 print:bg-transparent"
//                   >
//                     {i + 1}
//                   </th>
//                 ))}
//                 <th className="border border-slate-300 p-2 bg-indigo-50 print:bg-transparent">
//                   P
//                 </th>
//                 <th className="border border-slate-300 p-2 bg-rose-50 print:bg-transparent">
//                   A
//                 </th>
//                 <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold">
//                   %
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((s) => {
//                 let pCount = 0;
//                 let aCount = 0;

//                 // Calculate counts first to determine critical status
//                 {
//                   [...Array(daysInMonth)].map((_, d) => {
//                     const id = s._id?.toString();
//                     const status = attendanceMap[d + 1]?.[id];

//                     if (status === "Present") pCount++;
//                     if (status === "Absent") aCount++;
//                   });
//                 }

//                 const totalDays = pCount + aCount;
//                 const percentage =
//                   totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
//                 const isCritical = percentage < 75 && totalDays > 5;

//                 return (
//                   <tr
//                     key={s._id}
//                     className={`${
//                       isCritical ? "bg-rose-50/50" : "hover:bg-slate-50/50"
//                     }`}
//                   >
//                     <td className="border border-slate-200 p-2 font-medium">
//                       {/* Displays Personal No if provided, otherwise fallback to Roll */}
//                       {showRoll
//                         ? s.rollNumber
//                         : s.personalNo || s.employeeId || "—"}
//                     </td>
//                     <td className="border border-slate-200 p-2 font-semibold uppercase">
//                       {s.name}
//                     </td>
//                     {[...Array(daysInMonth)].map((_, d) => {
//                       const status = attendanceMap[d + 1]?.[s._id.toString()];

//                       return (
//                         <td
//                           key={d}
//                           className={`border border-slate-200 text-center font-bold h-8 w-8 ${
//                             status === "Absent"
//                               ? "bg-rose-50/30 text-rose-600 print:text-black"
//                               : ""
//                           }`}
//                         >
//                           {status === "Present"
//                             ? "P"
//                             : status === "Absent"
//                             ? "A"
//                             : ""}
//                         </td>
//                       );
//                     })}
//                     <td className="border border-slate-200 text-center font-bold text-emerald-600 print:text-black">
//                       {pCount}
//                     </td>
//                     <td className="border border-slate-200 text-center font-bold text-rose-600 print:text-black">
//                       {aCount}
//                     </td>
//                     <td className="border border-slate-200 text-center font-black bg-slate-50 print:bg-transparent">
//                       {percentage}%
//                       {isCritical && (
//                         <span className="ml-1 text-[8px] print:hidden">⚠️</span>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* SIGNATURE SECTION */}
//         <div className="mt-12 flex justify-between items-end px-4">
//           <div className="text-center border-t border-black pt-2 min-w-[200px]">
//             <p className="text-xs font-bold uppercase">
//               {showRoll ? "Class Teacher" : "Department Head"}
//             </p>
//           </div>
//           <div className="text-center border-t border-black pt-2 min-w-[200px]">
//             <p className="text-xs font-bold uppercase">Principal / Registrar</p>
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
                {[...Array(daysInMonth)].map((_, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 w-6 text-center bg-slate-100/50 print:bg-transparent font-medium"
                  >
                    {i + 1}
                  </th>
                ))}

                {/* Summary Headers */}
                <th className="border border-slate-300 p-1 bg-indigo-50/50 print:bg-transparent text-[8px] w-8 leading-tight">
                  CURR
                  <br />
                  PRES
                </th>
                <th className="border border-slate-300 p-1 bg-rose-50/50 print:bg-transparent text-[8px] w-8 leading-tight">
                  CURR
                  <br />
                  ABS
                </th>
                <th className="border border-slate-300 p-1 bg-amber-50/50 print:bg-transparent text-[8px] w-8 leading-tight">
                  PREV
                  <br />
                  PRES
                </th>
                <th className="border border-slate-300 p-1 bg-emerald-50 print:bg-transparent text-[9px] w-10 font-bold leading-tight">
                  GRAND
                  <br />
                  TOTAL
                </th>
                <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold">
                  %
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

                // 2. Derive Cumulative Totals
                // Ensure the property name "totalPresentTillDate" matches your API response
                const grandTotal = s.totalPresentTillDate || 0;
                const prevP = grandTotal - pCount;

                // 3. Percentage calculation (Monthly)
                const totalDays = pCount + aCount;
                const percentage =
                  totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
                const isCritical = percentage < 75 && totalDays > 5;

                return (
                  <tr
                    key={s._id}
                    className={`${isCritical ? "bg-rose-50/40" : "hover:bg-slate-50/50"} transition-colors`}
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {showRoll ? s.rollNumber : s.personalNo || "—"}
                    </td>
                    <td className="border border-slate-200 p-2 font-semibold uppercase whitespace-nowrap">
                      {s.name}
                    </td>

                    {/* Daily Presence Grid */}
                    {[...Array(daysInMonth)].map((_, d) => {
                      const status = attendanceMap[d + 1]?.[s._id.toString()];
                      return (
                        <td
                          key={d}
                          className={`border border-slate-200 text-center font-bold h-7 w-7 ${
                            status === "Absent"
                              ? "text-rose-600 bg-rose-50/20 print:text-black"
                              : ""
                          }`}
                        >
                          {status === "Present"
                            ? "P"
                            : status === "Absent"
                              ? "A"
                              : "·"}
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

                    {/* GRAND TOTAL - Fetched from DB */}
                    <td className="border border-slate-200 text-center font-black text-emerald-700 bg-emerald-50/40 print:bg-transparent">
                      {grandTotal}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
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
