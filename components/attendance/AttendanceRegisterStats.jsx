import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, BarChart3, TrendingUp } from "lucide-react";

export default function AttendanceRegisterStats({ data }) {
  const { students, attendanceDocs, daysInMonth, sessionStats } = data;

  // 1. Calculations for Current Month
  const totalStudents = students.length;
  const totalPossibleEntries = attendanceDocs.length * totalStudents;

  let monthlyPresent = 0;
  attendanceDocs.forEach((doc) => {
    doc.records.forEach((r) => {
      if (r.status === "Present") monthlyPresent++;
    });
  });

  const monthlyAvg =
    totalPossibleEntries > 0
      ? ((monthlyPresent / totalPossibleEntries) * 100).toFixed(1)
      : "0";

  // 2. Session Calculations
  const sessionAvg =
    sessionStats?.totalRecords > 0
      ? ((sessionStats.totalPresent / sessionStats.totalRecords) * 100).toFixed(
          1
        )
      : "0";

  return (
    <div className="mt-8 space-y-4 print:mt-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-indigo-600" />
        Register Summary & Final Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Enrollment Stats */}
        <StatBox
          title="Student Enrollment"
          mainValue={totalStudents}
          subLeft={`Start: ${totalStudents}`}
          subRight={`End: ${totalStudents}`}
          icon={<Users className="text-blue-500" />}
        />

        {/* Attendance Volume */}
        <StatBox
          title="Total Attendance"
          mainValue={monthlyPresent}
          subLeft="Total Present Marks"
          subRight={`${attendanceDocs.length} Days Marked`}
          icon={<Target className="text-emerald-500" />}
        />

        {/* Monthly Average */}
        <StatBox
          title="Monthly Average"
          mainValue={`${monthlyAvg}%`}
          subLeft="Class Performance"
          progress={parseFloat(monthlyAvg)}
          icon={<TrendingUp className="text-indigo-500" />}
        />

        {/* Session YTD */}
        <StatBox
          title="Session YTD"
          mainValue={`${sessionAvg}%`}
          subLeft="Cumulative Progress"
          progress={parseFloat(sessionAvg)}
          isSession
        />
      </div>

      {/* Verification Footer for Printing */}
      <div className="hidden print:flex justify-between mt-12 border-t pt-8 text-xs font-bold text-slate-500 uppercase">
        <div className="text-center w-48 border-t border-slate-900 pt-2">
          Class Teacher
        </div>
        <div className="text-center w-48 border-t border-slate-900 pt-2">
          Attendance Officer
        </div>
        <div className="text-center w-48 border-t border-slate-900 pt-2">
          Principal Signature
        </div>
      </div>
    </div>
  );
}

function StatBox({
  title,
  mainValue,
  subLeft,
  subRight,
  icon,
  progress,
  isSession,
}) {
  return (
    <Card
      className={`border-none shadow-sm ${
        isSession ? "bg-slate-900 text-white" : "bg-white"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <p
            className={`text-[10px] font-bold uppercase ${
              isSession ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {title}
          </p>
          {icon}
        </div>
        <div className="text-2xl font-black mb-1">{mainValue}</div>

        {progress !== undefined ? (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  progress > 85 ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-medium opacity-70">{subLeft}</p>
          </div>
        ) : (
          <div className="flex justify-between text-[10px] font-medium opacity-70">
            <span>{subLeft}</span>
            <span>{subRight}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
