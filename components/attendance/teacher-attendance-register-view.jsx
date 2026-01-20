// "use client";

// import useSWR from "swr";
// import AttendanceSummary from "./attendance-summary";
// import AttendanceTable from "./attendance-table";

// const fetcher = (url) => fetch(url).then((r) => r.json());

// export default function TeacherAttendanceRegisterView({ month, year }) {
//   const { data, isLoading } = useSWR(
//     `/api/attendance/teacher-register?month=${month}&year=${year}`,
//     fetcher
//   );

//   if (isLoading) return <p>Loading...</p>;

//   return (
//     <div className="space-y-6">
//       <AttendanceSummary
//         students={data.teachers}
//         attendanceDocs={data.attendanceDocs}
//         daysInMonth={data.daysInMonth}
//         label="Teachers"
//       />

//       <AttendanceTable
//         students={data.teachers}
//         attendanceDocs={data.attendanceDocs}
//         daysInMonth={data.daysInMonth}
//         personKey="teacherId"
//         showRoll={false}
//       />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Printer,
  Filter,
  Users,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate last 5 years for the selector
const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

export default function TeacherAttendanceRegisterView() {
  const [filters, setFilters] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });

  const queryPath = `/api/attendance/teacher-register?month=${filters.month}&year=${filters.year}`;
  const { data, isLoading } = useSWR(queryPath, fetcher);

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (!data) return;

    const { teachers, attendanceDocs, daysInMonth } = data;

    const attendanceMap = attendanceDocs.reduce((acc, doc) => {
      const day = new Date(doc.date).getDate();
      acc[day] = acc[day] || {};
      acc[day][doc.teacherId] = doc.status;
      return acc;
    }, {});

    // 1. Updated Header to "Personal No."
    const headers = [
      "Personal No.",
      "Teacher Name",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      "Present",
      "Absent",
      "Percentage",
    ];

    const rows = teachers.map((t) => {
      let pCount = 0;
      let aCount = 0;

      const dailyStatus = Array.from({ length: daysInMonth }, (_, i) => {
        const status = attendanceMap[i + 1]?.[t._id];
        if (status === "Present") pCount++;
        if (status === "Absent") aCount++;
        return status || "-";
      });

      const percentage =
        pCount + aCount > 0
          ? Math.round((pCount / (pCount + aCount)) * 100)
          : 0;

      return [
        t.personalNo || t.employeeId || "N/A", // Using Personal No. field
        t.name,
        ...dailyStatus,
        pCount,
        aCount,
        `${percentage}%`,
      ];
    });

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Teacher_Attendance_${filters.month}_${filters.year}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Filter className="h-4 w-4" />
                <span>Staff Registry</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Month Selector */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">
                    Month
                  </Label>
                  <Select
                    value={filters.month}
                    onValueChange={(v) => setFilters({ ...filters, month: v })}
                  >
                    <SelectTrigger className="w-[140px] h-9 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Selector */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">
                    Year
                  </Label>
                  <Select
                    value={filters.year}
                    onValueChange={(v) => setFilters({ ...filters, year: v })}
                  >
                    <SelectTrigger className="w-[110px] h-9 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isLoading || !data}
                className="bg-white border-slate-200"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>

              <Button
                size="sm"
                onClick={() => window.print()}
                disabled={isLoading || !data}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" /> Print Register
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* <AttendanceSummary
            students={data.teachers}
            attendanceDocs={data.attendanceDocs}
            daysInMonth={data.daysInMonth}
            label="Staff Members"
          /> */}

          <AttendanceSummary
            students={data.teachers}
            attendanceDocs={data.attendanceDocs}
            daysInMonth={data.daysInMonth}
            label="Staff"
            personKey="teacherId"
          />

          <div className="print:m-0 print:p-0">
            <AttendanceTable
              students={data.teachers}
              attendanceDocs={data.attendanceDocs}
              daysInMonth={data.daysInMonth}
              month={filters.month}
              year={filters.year}
              personKey="teacherId"
              showRoll={false} // This triggers "Personal No" logic in the table
              idLabel="Personal No." // Pass the custom label to your table
            />
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-slate-400">
          <Users className="h-12 w-12 mb-2 opacity-20" />
          <p>
            No records found for{" "}
            {MONTHS.find((m) => m.value === filters.month)?.label}{" "}
            {filters.year}
          </p>
        </div>
      )}
    </div>
  );
}
