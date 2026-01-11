"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AttendanceRegisterView({
  classId,
  sectionId,
  month,
  year,
}) {
  const { data, isLoading } = useSWR(
    `/api/attendance/register?classId=${classId}&sectionId=${sectionId}&month=${month}&year=${year}`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner size="lg" />;

  const { students, attendanceDocs, daysInMonth } = data;

  return (
    <div className="space-y-6 print:p-0">
      {/* SUMMARY */}
      <AttendanceSummary
        students={students}
        attendanceDocs={attendanceDocs}
        daysInMonth={daysInMonth}
      />

      {/* TABLE */}
      <AttendanceTable
        students={students}
        attendanceDocs={attendanceDocs}
        daysInMonth={daysInMonth}
        month={month}
        year={year}
      />
    </div>
  );
}
