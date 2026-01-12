"use client";

import useSWR from "swr";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function TeacherAttendanceRegisterView({ month, year }) {
  const { data, isLoading } = useSWR(
    `/api/attendance/teacher-register?month=${month}&year=${year}`,
    fetcher
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <AttendanceSummary
        students={data.teachers}
        attendanceDocs={data.attendanceDocs}
        daysInMonth={data.daysInMonth}
        label="Teachers"
      />

      <AttendanceTable
        students={data.teachers}
        attendanceDocs={data.attendanceDocs}
        daysInMonth={data.daysInMonth}
        personKey="teacherId"
        showRoll={false}
      />
    </div>
  );
}
