"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { getMonthName } from "@/lib/constants";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function AttendanceRegisterPrint({
  classId,
  sectionId,
  month,
  year,
}) {
  const { data, isLoading } = useSWR(
    `/api/attendance/register?classId=${classId}&sectionId=${sectionId}&month=${month}&year=${year}`,
    fetcher
  );

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (!data) return <p>No data</p>;

  const { students, attendanceDocs, daysInMonth } = data;

  // 🔑 Get status from records[]
  const getStatus = (studentId, day) => {
    const doc = attendanceDocs.find((d) => new Date(d.date).getDate() === day);

    if (!doc) return "";

    const record = doc.records.find(
      (r) => String(r.personId) === String(studentId)
    );

    if (!record) return "";

    // Short codes for print
    switch (record.status) {
      case "Present":
        return "P";
      case "Absent":
        return "A";
      case "Late":
        return "L";
      case "Leave":
        return "LV";
      case "Half Day":
        return "HD";
      default:
        return "";
    }
  };

 

  return (
    <div className="bg-white text-black p-4">
      {/* PRINT BUTTON */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Attendance Register
        </Button>
      </div>

      <h2 className="text-center font-bold text-lg mb-1">
        Student Attendance Register
      </h2>

      <p className="text-center text-sm mb-4">
        {/* Month: {month + 1} / {year}  */}
        Month: {getMonthName(month)} ({month}) / {year}
      </p>

      <div className="overflow-x-auto">
        <table className="border w-full text-[10px]">
          <thead>
            <tr>
              <th className="border p-1">Roll</th>
              <th className="border p-1 w-40">Student Name</th>

              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i} className="border p-1 w-6">
                  {i + 1}
                </th>
              ))}

              <th className="border p-1">P</th>
              <th className="border p-1">A</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              let present = 0;
              let absent = 0;

              return (
                <tr key={s._id}>
                  <td className="border p-1 text-center">{s.rollNumber}</td>
                  <td className="border p-1">{s.name}</td>

                  {[...Array(daysInMonth)].map((_, i) => {
                    const status = getStatus(s._id, i + 1);
                    if (status === "P") present++;
                    if (status === "A") absent++;

                    return (
                      <td key={i} className="border text-center">
                        {status}
                      </td>
                    );
                  })}

                  <td className="border text-center">{present}</td>
                  <td className="border text-center">{absent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between text-xs">
        <span>Class Teacher Signature: __________</span>
        <span>Principal Signature: __________</span>
      </div>
    </div>
  );
}
