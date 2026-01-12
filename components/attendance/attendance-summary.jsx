import { Card } from "@/components/ui/card";

export default function AttendanceSummary({
  students,
  attendanceDocs,
  daysInMonth,
  month,
  year,
}) {
  const totalStudents = students?.length;
  const totalMarkedDays = attendanceDocs.length;

  let presentCount = 0;
  let absentCount = 0;

  attendanceDocs.forEach((doc) => {
    doc.records.forEach((r) => {
      if (r.status === "Present") presentCount++;
      if (r.status === "Absent") absentCount++;
    });
  });

  const attendanceRate =
    totalMarkedDays === 0
      ? 0
      : Math.round((presentCount / (totalStudents * totalMarkedDays)) * 100);
console.log(month, year)

  return (
    <div className="">
      <p className="text-2xl font-bold">
        {month} {year}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Students/Days in Month</p>
          <p className="text-2xl font-bold">{totalStudents}/{daysInMonth}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Days Marked</p>
          <p className="text-2xl font-bold">{totalMarkedDays}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Present</p>
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Attendance %</p>
          <p className="text-2xl font-bold">{attendanceRate}%</p>
        </Card>
      </div>
    </div>
  );
}
