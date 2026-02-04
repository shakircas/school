// import { Card, CardContent } from "../ui/card";

// export default function AttendanceSummary({
//   students, // This represents the list of people (Students or Teachers)
//   attendanceDocs,
//   daysInMonth,
//   label = "Students", // Default label for the footer/UI
//   personKey = "studentId", // Key to look for in the attendance records
// }) {
//   const totalPeople = students?.length || 0;
//   const daysMarked = attendanceDocs?.length || 0;

//   let presentCount = 0;

//   // 1. Calculate cumulative presents across all documents
//   attendanceDocs?.forEach((doc) => {
//     doc.records?.forEach((r) => {
//       if (r.status === "Present") presentCount++;
//     });
//   });

//   // 2. Calculate average attendance
//   const totalPossible = totalPeople * daysMarked;
//   const avgAttendance =
//     totalPossible > 0 ? Math.round((presentCount / totalPossible) * 100) : 0;

//   // 3. Track low attendance individuals (< 75%)
//   const stats = students?.map((person) => {
//     const personPresentCount = attendanceDocs.filter((doc) =>
//       doc.records.some(
//         (r) => r[personKey] === person._id && r.status === "Present"
//       )
//     ).length;

//     const avg = presentCount / students.length;
//     const avg1 = totalPossible / students.length;

//     console.log(avg);

//     console.log(avg1);

//     return {
//       rate: daysMarked > 0 ? (personPresentCount / daysMarked) * 100 : 0,
//     };
//   });

//   const criticalCount =
//     stats?.filter((s) => s.rate < 75 && daysMarked > 5).length || 0;

//   // UI Theme color based on label (Emerald for Staff/Teachers, Indigo for Students)
//   const themeColor =
//     label === "Students" ? "text-indigo-600" : "text-emerald-600";

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
//       <StatCard
//         title="Overall Attendance"
//         value={`${avgAttendance}%`}
//         footer="Monthly average"
//         color={themeColor}
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
//         value={criticalCount}
//         footer={`${label} < 75%`}
//         color={criticalCount > 0 ? "text-rose-600" : "text-emerald-600"}
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

"use client";

import { Card, CardContent } from "../ui/card";

export default function AttendanceSummary({
  students,
  attendanceDocs,
  daysInMonth,
  label = "Students",
  totalMarked,
}) {
  const totalPeople = students?.length || 0;
  const daysMarked = attendanceDocs?.length || 0;


  // 1. Monthly Stats Calculation
  let monthlyPresentCount = 0;
  attendanceDocs?.forEach((doc) => {
    doc.records?.forEach((r) => {
      if (r.status === "Present") monthlyPresentCount++;
    });
  });

  const totalMonthlyPossible = totalPeople * daysMarked;
  const monthlyClassAvg =
    totalMonthlyPossible > 0
      ? Math.round((monthlyPresentCount / totalMonthlyPossible) * 100)
      : 0;
  const monthlyClassAvg1 =
    totalMonthlyPossible > 0
      ? (monthlyPresentCount / totalPeople).toFixed(1)
      : 0;

  // 2. Cumulative (Session) Stats Calculation
  // We sum up the totalPresentTillDate (which includes previous months + current)
  const totalSessionPresents =
    students?.reduce((acc, s) => acc + (s.totalPresentTillDate || 0), 0) || 0;

  const totalSessionAbsents =
    students?.reduce((acc, s) => acc + (s.totalAbsentTillDate || 0), 0) || 0;

  // To get the session average, we need to know how many days have been marked in the whole session
  // We can estimate this from the first student's session stats or pass it from API
  // Here we calculate the average presents per student for the session
  const avgSessionPresentsPerStudent =
    totalPeople > 0 ? (totalSessionPresents / totalPeople).toFixed(1) : 0;

  // 3. Critical Cases Check (Current Month < 75%)
  const criticalCount =
    students?.filter((person) => {
      const personPresentCount = attendanceDocs?.filter((doc) =>
        doc.records.some(
          (r) =>
            (r.personId === person._id || r.studentId === person._id) &&
            r.status === "Present"
        )
      ).length;
      const rate = daysMarked > 0 ? (personPresentCount / daysMarked) * 100 : 0;
      return rate < 75 && daysMarked > 5;
    }).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 print:hidden">
      {/* Monthly Class Average */}
      {/* <StatCard
        title="Class Monthly Avg"
        value={`${monthlyClassAvg}%`}
        footer="Current month 5"
        color="text-indigo-600"
      /> */}
      {/* Monthly Class Average */}
      <StatCard
        title="Class Monthly Avg"
        value={`${monthlyClassAvg1}`}
        footer="Current month performance"
        color="text-indigo-600"
      />

      {/* Monthly Cumulative Presents */}
      <StatCard
        title="Monthly Presents"
        value={monthlyPresentCount}
        footer={`Total across ${daysMarked} / ${daysInMonth} days`}
        color="text-emerald-600"
      />

      <StatCard
        title="Session Grand Avg"
        value={`${avgSessionPresentsPerStudent}`}
        footer="Cumulative session performance"
        color="text-indigo-600"
      />

      {/* Session Cumulative Stats (Prev + Current) */}
      <StatCard
        title="Session Grand Total"
        value={`${totalSessionPresents}/${totalSessionAbsents}`}
        footer="Cumulative (Session YTD)"
        color="text-blue-700"
      />

      {/* Critical Cases */}
      <StatCard
        title="Critical Cases"
        value={criticalCount}
        footer={`${label} below 75%`}
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
