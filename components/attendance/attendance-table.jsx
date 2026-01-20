// import { buildAttendanceMap } from "@/lib/attendance-utils";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "../ui/card";
// import { Button } from "../ui/button";
// import { Printer } from "lucide-react";
// import { getMonthName } from "@/lib/constants";

// export default function AttendanceTable({
//   students,
//   attendanceDocs,
//   daysInMonth,
//   month,
//   year,
// }) {
//   const attendanceMap = buildAttendanceMap(attendanceDocs);

//   return (
//     <Card className="p-4">
//       <h2 className="text-center font-bold text-lg mb-1">
//         Student Attendance Register
//       </h2>

//       <p className="text-center text-sm mb-4">
//         {/* Month: {month + 1} / {year}  */}
//         Month: {getMonthName(month)} ({month}) / {year}
//       </p>
//       <div className="overflow-x-auto border rounded-lg print:border-none">
//         <table className="w-full bg-white text-xs border-collapse">
//           <thead>
//             <tr>
//               <th className="border p-2">Roll</th>
//               <th className="border p-2">Name</th>

//               {[...Array(daysInMonth)].map((_, i) => (
//                 <th key={i} className="border p-1">
//                   {i + 1}
//                 </th>
//               ))}

//               <th className="border p-2">P</th>
//               <th className="border p-2">A</th>
//               <th className="border p-2">%</th>
//             </tr>
//           </thead>

//           <tbody>
//             {students.map((s) => {
//               let present = 0;
//               let absent = 0;

//               return (
//                 <tr key={s._id}>
//                   <td className="border p-1">{s.rollNumber}</td>
//                   <td className="border p-1 whitespace-nowrap">{s.name}</td>

//                   {[...Array(daysInMonth)].map((_, d) => {
//                     const status = attendanceMap[d + 1]?.[s._id];

//                     if (status === "Present") present++;
//                     if (status === "Absent") absent++;

//                     return (
//                       <td key={d} className="border text-center">
//                         {status === "Present" && (
//                           <span className="text-green-600 font-bold">P</span>
//                         )}
//                         {status === "Absent" && (
//                           <span className="text-red-600 font-bold">A</span>
//                         )}
//                       </td>
//                     );
//                   })}

//                   <td className="border text-center font-bold">{present}</td>
//                   <td className="border text-center font-bold">{absent}</td>
//                   <td className="border text-center font-bold">
//                     {present + absent === 0
//                       ? "-"
//                       : Math.round((present / (present + absent)) * 100)}
//                     %
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//         <div className="mt-6 flex justify-between text-xs">
//           <span>Class Teacher Signature: __________</span>
//           <span>Principal Signature: __________</span>
//         </div>
//       </div>
//     </Card>
//   );
// }

// import { buildAttendanceMap } from "@/lib/attendance-utils";
// import { getMonthName } from "@/lib/constants";
// import { Card } from "../ui/card";

// export default function AttendanceTable({
//   students,
//   attendanceDocs,
//   daysInMonth,
//   month,
//   year,
// }) {
//   const attendanceMap = buildAttendanceMap(attendanceDocs);

//   return (
//     <Card className="border-none shadow-lg print:shadow-none print:border-none">
//       <div className="p-6 print:p-0">
//         <div className="hidden print:block text-center mb-6">
//           <h1 className="text-2xl font-bold uppercase">
//             Official Attendance Register
//           </h1>
//           <p className="text-lg">
//             {getMonthName(month)} {year}
//           </p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-[10px] sm:text-xs">
//             <thead>
//               <tr className="bg-slate-50 print:bg-transparent">
//                 <th className="border border-slate-300 p-2 text-left">Roll</th>
//                 <th className="border border-slate-300 p-2 text-left min-w-[150px]">
//                   Student Name
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
//                 const percentage = Math.round(
//                   (pCount / (pCount + aCount)) * 100
//                 );
//                 const isCritical = percentage < 75 && pCount + aCount > 5;
//                 return (
//                   <tr
//                     key={s._id}
//                     className={`${
//                       isCritical ? "bg-rose-50/50" : "hover:bg-slate-50/50"
//                     }`}
//                   >
//                     <td className="border border-slate-200 p-2 font-medium">
//                       {s.rollNumber}
//                     </td>
//                     <td className="border border-slate-200 p-2 font-semibold uppercase">
//                       {s.name}
//                     </td>
//                     {[...Array(daysInMonth)].map((_, d) => {
//                       const status = attendanceMap[d + 1]?.[s._id];
//                       if (status === "Present") pCount++;
//                       if (status === "Absent") aCount++;
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
//                       {pCount + aCount > 0
//                         ? Math.round((pCount / (pCount + aCount)) * 100)
//                         : 0}
//                       %{" "}
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

//         {/* SIGNATURE SECTION - Visible only on Print or at bottom */}
//         <div className="mt-12 flex justify-between items-end px-4">
//           <div className="text-center border-t border-black pt-2 min-w-[200px]">
//             <p className="text-xs font-bold uppercase">Class Teacher</p>
//           </div>
//           <div className="text-center border-t border-black pt-2 min-w-[200px]">
//             <p className="text-xs font-bold uppercase">Principal Office</p>
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @media print {
//           body * {
//             // visibility: hidden;
//           }
//           .print-container,
//           .print-container * {
//             visibility: visible;
//           }
//           .print-container {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//           }
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
//           }
//         }
//       `}</style>
//     </Card>
//   );
// }

import { buildAttendanceMap } from "@/lib/attendance-utils";
import { getMonthName } from "@/lib/constants";
import { Card } from "../ui/card";

export default function AttendanceTable({
  students, // This acts as the list for both Students or Teachers
  attendanceDocs,
  daysInMonth,
  month,
  year,
  personKey = "studentId", // Default key for attendance mapping
  showRoll = true, // Toggle between Roll No and Personal No
  idLabel = "Roll", // The header label
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
                {/* Dynamic ID Label */}
                <th className="border border-slate-300 p-2 text-left">
                  {idLabel}
                </th>
                <th className="border border-slate-300 p-2 text-left min-w-[150px]">
                  {showRoll ? "Student Name" : "Teacher Name"}
                </th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 w-6 text-center bg-slate-100/50 print:bg-transparent"
                  >
                    {i + 1}
                  </th>
                ))}
                <th className="border border-slate-300 p-2 bg-indigo-50 print:bg-transparent">
                  P
                </th>
                <th className="border border-slate-300 p-2 bg-rose-50 print:bg-transparent">
                  A
                </th>
                <th className="border border-slate-300 p-2 bg-slate-100 print:bg-transparent font-bold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                let pCount = 0;
                let aCount = 0;

                // Calculate counts first to determine critical status
                {
                  [...Array(daysInMonth)].forEach((_, d) => {
                    const status = attendanceMap[d + 1]?.[s._id];
                    if (status === "Present") pCount++;
                    if (status === "Absent") aCount++;
                  });
                }

                const totalDays = pCount + aCount;
                const percentage =
                  totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;
                const isCritical = percentage < 75 && totalDays > 5;

                return (
                  <tr
                    key={s._id}
                    className={`${
                      isCritical ? "bg-rose-50/50" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {/* Displays Personal No if provided, otherwise fallback to Roll */}
                      {showRoll
                        ? s.rollNumber
                        : s.personalNo || s.employeeId || "—"}
                    </td>
                    <td className="border border-slate-200 p-2 font-semibold uppercase">
                      {s.name}
                    </td>
                    {[...Array(daysInMonth)].map((_, d) => {
                      const status = attendanceMap[d + 1]?.[s._id];
                      return (
                        <td
                          key={d}
                          className={`border border-slate-200 text-center font-bold h-8 w-8 ${
                            status === "Absent"
                              ? "bg-rose-50/30 text-rose-600 print:text-black"
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
                    <td className="border border-slate-200 text-center font-bold text-emerald-600 print:text-black">
                      {pCount}
                    </td>
                    <td className="border border-slate-200 text-center font-bold text-rose-600 print:text-black">
                      {aCount}
                    </td>
                    <td className="border border-slate-200 text-center font-black bg-slate-50 print:bg-transparent">
                      {percentage}%
                      {isCritical && (
                        <span className="ml-1 text-[8px] print:hidden">⚠️</span>
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
          <div className="text-center border-t border-black pt-2 min-w-[200px]">
            <p className="text-xs font-bold uppercase">
              {showRoll ? "Class Teacher" : "Department Head"}
            </p>
          </div>
          <div className="text-center border-t border-black pt-2 min-w-[200px]">
            <p className="text-xs font-bold uppercase">Principal / Registrar</p>
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