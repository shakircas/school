"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Award, AlertCircle, BookOpen } from "lucide-react";

export function ClassAnalytics({ results }) {
  const stats = useMemo(() => {
    if (!results.length) return null;

    const subjectStats = {};
    let totalObtained = 0;
    let totalPossible = 0;

    results.forEach((res) => {
      res.subjects.forEach((s) => {
        if (!subjectStats[s.subject]) {
          subjectStats[s.subject] = { total: 0, count: 0, highest: 0 };
        }
        subjectStats[s.subject].total += s.obtainedMarks;
        subjectStats[s.subject].count += 1;
        if (s.obtainedMarks > subjectStats[s.subject].highest) {
          subjectStats[s.subject].highest = s.obtainedMarks;
        }
        totalObtained += s.obtainedMarks;
        totalPossible += s.totalMarks;
      });
    });

    const averagePercentage = ((totalObtained / totalPossible) * 100).toFixed(
      1,
    );

    // Get Top 3 Students
    const rankedStudents = results
      .map((r) => ({
        name: r.student.name,
        percent: (
          (r.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0) /
            r.subjects.reduce((sum, s) => sum + s.totalMarks, 0)) *
          100
        ).toFixed(1),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);

    return { subjectStats, averagePercentage, rankedStudents };
  }, [results]);

  if (!stats) return null;

  return (
    <div className="space-y-6 print:hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* OVERALL PERFORMANCE */}
        <Card className="bg-primary text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">
              {stats.averagePercentage}%
            </div>
            <p className="text-[10px] text-white mt-1 uppercase tracking-widest">
              Aggregate across all subjects
            </p>
          </CardContent>
        </Card>

        {/* TOP PERFORMERS */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.rankedStudents.map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {i + 1}. {s.name}
                </span>
                <span className="text-xs font-black bg-slate-100 px-2 py-0.5 rounded">
                  {s.percent}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* QUICK STATS */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Student Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-slate-500 italic">
              Active records in this session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SUBJECT ANALYSIS */}
      <Card className="border-none shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 font-black italic">
            <BookOpen className="h-5 w-5" /> Subject-wise Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {Object.entries(stats.subjectStats).map(([name, data]) => {
            const avg = (data.total / data.count).toFixed(0);
            return (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span>{name}</span>
                  <span className="text-slate-400">
                    Avg: {avg}% | Max: {data.highest}
                  </span>
                </div>
                <Progress value={avg} className="h-2 bg-slate-100" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
