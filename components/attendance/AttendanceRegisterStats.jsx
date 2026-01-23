"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Target,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AttendanceRegisterStats({ data }) {
  // 1. Safety Guard: If data is missing or ill-formatted, don't crash the app
  if (!data || !data.students || !data.attendanceDocs) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl text-slate-400">
        <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
        <p>Statistics calculation pending data...</p>
      </div>
    );
  }

  const { students, attendanceDocs, sessionStats, totalMarked } = data;

  // Calculate specific counts
  const activeCount = students.filter(s => s.status === "Active").length;
  const withdrawnThisMonth = students.filter(s => s.status === "Inactive").length;

  // 2. Monthly Calculations
  const totalStudents = students.length;
  const markedDays = attendanceDocs.length;
  // Possible entries = (number of students) * (number of days attendance was taken)
  const totalPossibleEntries = markedDays * totalStudents;

  let monthlyPresent = 0;
  attendanceDocs.forEach((doc) => {
    doc.records?.forEach((r) => {
      if (r.status === "Present") monthlyPresent++;
    });
  });

  const monthlyAvgNum =
    totalPossibleEntries > 0
      ? (monthlyPresent / totalPossibleEntries) * 100
      : 0;
  const monthlyAvg = monthlyAvgNum.toFixed(1);

  // 3. Session YTD Calculations
  // Logic: Session % is based on (Total Session Presents) / (Expected Session Records)
  // Note: We use a safe fallback if totalRecords isn't in your API yet
  const sessionPresent = sessionStats?.totalPresent || 0;
  const sessionTotalRecords =
    sessionStats?.totalRecords || totalPossibleEntries || 1;

  const sessionAvgNum = (sessionPresent / sessionTotalRecords) * 100;
  const sessionAvg = sessionAvgNum > 0 ? sessionAvgNum.toFixed(1) : monthlyAvg;


  const openingEnrollment = students.length; // Everyone who was there at start
  // const withdrawnThisMonth = students.filter(
  //   (s) => s.status === "Withdrawn"
  // ).length;
  const closingEnrollment = openingEnrollment - withdrawnThisMonth;

  return (
    <div className="mt-8 space-y-4 print:mt-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-indigo-600" />
        Register Summary & Final Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Enrollment Stats */}
        {/* <StatBox
          title="Student Enrollment"
          mainValue={totalStudents}
          subLeft={`Active: ${totalStudents}`}
          subRight="Current Term"
          icon={<Users className="text-blue-500 h-4 w-4" />}
        /> */}

        <StatBox
          title="Enrollment Movement"
          mainValue={`${openingEnrollment} → ${closingEnrollment}`}
          subLeft={`Withdrawn: ${withdrawnThisMonth}`}
          subRight="Start → End"
          icon={<Users className="text-blue-500 h-4 w-4" />}
        />

        <StatBox
          title="Enrollment"
          mainValue={activeCount}
          subLeft={`Withdrawn: ${withdrawnThisMonth}`}
          subRight={`Total: ${students.length}`}
          icon={<Users className="text-blue-500 h-4 w-4" />}
        />

        <StatBox
          title="Total Days Marked in Session"
          mainValue={totalMarked}
          subLeft="Total Days Marked"
          subRight="Current Term"
          icon={<Target className="text-emerald-500 h-4 w-4" />}
        />

        {/* Attendance Volume */}
        <StatBox
          title="Attendance Count"
          mainValue={monthlyPresent}
          subLeft="Total Presents"
          subRight={`${markedDays} Days Marked`}
          icon={<Target className="text-emerald-500 h-4 w-4" />}
        />

        {/* Monthly Average */}
        <StatBox
          title="Monthly Average"
          mainValue={`${monthlyAvg}%`}
          subLeft="Class Performance"
          progress={monthlyAvgNum}
          icon={<TrendingUp className="text-indigo-500 h-4 w-4" />}
        />

        {/* Session YTD */}
        <StatBox
          title="Session YTD"
          mainValue={`${sessionAvg}%`}
          subLeft="Session Progress"
          progress={parseFloat(sessionAvg)}
          isSession
        />
      </div>

      {/* Verification Footer for Printing */}
      <div className="hidden print:flex justify-between mt-12 border-t pt-8 text-[10px] font-bold text-slate-500 uppercase">
        <div className="text-center w-48 border-t-2 border-slate-900 pt-2">
          Class Teacher
        </div>
        <div className="text-center w-48 border-t-2 border-slate-900 pt-2">
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
      className={`border-none shadow-sm ${isSession ? "bg-slate-900 text-white" : "bg-white"}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <p
            className={`text-[10px] font-bold uppercase ${isSession ? "text-slate-400" : "text-slate-500"}`}
          >
            {title}
          </p>
          {icon}
        </div>
        <div className="text-2xl font-black mb-1">{mainValue}</div>

        {progress !== undefined ? (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-200/20 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  progress > 85
                    ? "bg-emerald-500"
                    : progress > 70
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
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
