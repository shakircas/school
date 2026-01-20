// import { Card, CardContent } from "../ui/card";

// export default function AttendanceSummary({
//   students,
//   attendanceDocs,
//   daysInMonth,
// }) {
//   const totalStudents = students?.length || 0;
//   const daysMarked = attendanceDocs?.length;

//   let presentCount = 0;
//   let totalPossible = totalStudents * daysMarked;

//   // Track low attendance students (< 75%)
//   const studentStats = students?.map((s) => {
//     const studentPresent = attendanceDocs.filter((doc) =>
//       doc.records.find((r) => r.studentId === s._id && r.status === "Present")
//     ).length;
//     return { name: s.name, rate: (studentPresent / daysMarked) * 100 };
//   });

//   attendanceDocs?.forEach((doc) => {
//     doc.records.forEach((r) => {
//       if (r.status === "Present") presentCount++;
//     });
//   });

//   const avgAttendance =
//     totalPossible > 0 ? Math.round((presentCount / totalPossible) * 100) : 0;
//   const criticalStudents = studentStats?.filter(
//     (s) => s.rate < 75 && daysMarked > 5
//   ).length;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
//       <StatCard
//         title="Overall Attendance"
//         value={`${avgAttendance}%`}
//         footer="Monthly average"
//         color="text-indigo-600"
//       />
//       <StatCard
//         title="Days Conducted"
//         value={daysMarked}
//         footer={`Out of ${daysInMonth} days`}
//         color="text-slate-900"
//       />
//       <StatCard
//         title="Total Presents"
//         value={presentCount}
//         footer="Cumulative count"
//         color="text-emerald-600"
//       />
//       <StatCard
//         title="Critical Cases"
//         value={criticalStudents}
//         footer="Students < 75%"
//         color={criticalStudents > 0 ? "text-rose-600" : "text-emerald-600"}
//       />
//     </div>
//   );
// }

// function StatCard({ title, value, footer, color }) {
//   return (
//     <Card className="border-none shadow-sm bg-white">
//       <CardContent className="p-5">
//         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//           {title}
//         </p>
//         <p className={`text-3xl font-black my-1 ${color}`}>{value}</p>
//         <p className="text-[11px] text-slate-400 font-medium">{footer}</p>
//       </CardContent>
//     </Card>
//   );
// }

import { Card, CardContent } from "../ui/card";

export default function AttendanceSummary({
  students, // This represents the list of people (Students or Teachers)
  attendanceDocs,
  daysInMonth,
  label = "Students", // Default label for the footer/UI
  personKey = "studentId", // Key to look for in the attendance records
}) {
  const totalPeople = students?.length || 0;
  const daysMarked = attendanceDocs?.length || 0;

  let presentCount = 0;

  // 1. Calculate cumulative presents across all documents
  attendanceDocs?.forEach((doc) => {
    doc.records?.forEach((r) => {
      if (r.status === "Present") presentCount++;
    });
  });

  // 2. Calculate average attendance
  const totalPossible = totalPeople * daysMarked;
  const avgAttendance =
    totalPossible > 0 ? Math.round((presentCount / totalPossible) * 100) : 0;

  // 3. Track low attendance individuals (< 75%)
  const stats = students?.map((person) => {
    const personPresentCount = attendanceDocs.filter((doc) =>
      doc.records.some(
        (r) => r[personKey] === person._id && r.status === "Present"
      )
    ).length;

    return {
      rate: daysMarked > 0 ? (personPresentCount / daysMarked) * 100 : 0,
    };
  });

  const criticalCount =
    stats?.filter((s) => s.rate < 75 && daysMarked > 5).length || 0;

  // UI Theme color based on label (Emerald for Staff/Teachers, Indigo for Students)
  const themeColor =
    label === "Students" ? "text-indigo-600" : "text-emerald-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      <StatCard
        title="Overall Attendance"
        value={`${avgAttendance}%`}
        footer="Monthly average"
        color={themeColor}
      />
      <StatCard
        title="Days Conducted"
        value={daysMarked}
        footer={`Out of ${daysInMonth} days`}
        color="text-slate-900"
      />
      <StatCard
        title="Total Presents"
        value={presentCount}
        footer="Cumulative count"
        color="text-emerald-600"
      />
      <StatCard
        title="Critical Cases"
        value={criticalCount}
        footer={`${label} < 75%`}
        color={criticalCount > 0 ? "text-rose-600" : "text-emerald-600"}
      />
    </div>
  );
}

function StatCard({ title, value, footer, color }) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-3xl font-black my-1 ${color}`}>{value}</p>
        <p className="text-[11px] text-slate-400 font-medium">{footer}</p>
      </CardContent>
    </Card>
  );
}