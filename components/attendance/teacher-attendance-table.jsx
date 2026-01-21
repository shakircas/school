"use client";

import { getMonthName } from "@/lib/constants";
import { Card } from "@/components/ui/card";

function buildAttendanceMap(attendanceDocs) {
  const map = {};

  attendanceDocs.forEach((doc) => {
    const day = new Date(doc.date).getDate();

    if (!map[day]) {
      map[day] = {};
    }

    doc.records.forEach((record) => {
      // 1. Get the raw ID source
      const source = record.personId || record.teacherId || record.studentId;

      if (source) {
        // 2. Check if the source is an object (with _id) or just a string/ObjectId
        const idString =
          typeof source === "object" && source._id
            ? source._id.toString()
            : source.toString();

        // 3. Map the status to the CLEAN string ID
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
  // This helper correctly parses the records array from your schema
  const attendanceMap = buildAttendanceMap(attendanceDocs);

  return (
    <Card className="border-none shadow-lg print:shadow-none">
      <div className="p-6 print:p-0">
        {/* PRINT HEADER */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold uppercase text-slate-900">
            Official Staff Attendance Register
          </h1>
          <p className="text-lg text-slate-600">
            {getMonthName(month)} {year}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-xs">
            <thead>
              <tr className="bg-slate-50 print:bg-transparent">
                <th className="border border-slate-300 p-2 text-left">
                  Personal No.
                </th>
                <th className="border border-slate-300 p-2 text-left min-w-[150px]">
                  Teacher Name
                </th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 w-7 text-center bg-slate-100/30"
                  >
                    {i + 1}
                  </th>
                ))}
                <th className="border border-slate-300 p-2 bg-emerald-50 text-emerald-700">
                  P
                </th>
                <th className="border border-slate-300 p-2 bg-rose-50 text-rose-700">
                  A
                </th>
                <th className="border border-slate-300 p-2 bg-slate-100 font-bold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                let pCount = 0;
                let aCount = 0;

                // IMPORTANT: MongoDB IDs must be converted to strings for lookup
                const tId = teacher._id.toString();

                // Calculate summary for the row
                [...Array(daysInMonth)].forEach((_, d) => {
                  const status = attendanceMap[d + 1]?.[tId];
                  if (status === "Present") pCount++;
                  if (status === "Absent") aCount++;
                });

                const total = pCount + aCount;
                const percentage =
                  total > 0 ? Math.round((pCount / total) * 100) : 0;

                return (
                  <tr
                    key={tId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="border border-slate-200 p-2 font-medium">
                      {teacher.personalNo || teacher.employeeId || "—"}
                    </td>
                    <td className="border border-slate-200 p-2 font-semibold uppercase">
                      {teacher.name}
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
                    <td className="border border-slate-200 text-center font-bold text-rose-600">
                      {aCount}
                    </td>
                    <td className="border border-slate-200 text-center font-black bg-slate-50">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="mt-12 hidden print:flex justify-between items-end px-10">
          <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
            <p className="text-xs font-bold uppercase">Department Head</p>
          </div>
          <div className="text-center border-t-2 border-slate-900 pt-2 min-w-[200px]">
            <p className="text-xs font-bold uppercase">Principal Signature</p>
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
