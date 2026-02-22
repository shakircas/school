"use client";

import React from "react";
import {
  X,
  User,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import PredictedGrade from "./PredictedGrade";

export default function StudentDeepDive({ student, isOpen, onClose }) {
  if (!student) return null;

  // Mock data for the Radar Chart (Subject Strength vs Class Avg)
  //   const radarData =
  //     student.subjectBreakdown?.map((sub) => ({
  //       subject: sub.subject,
  //       studentScore: sub.average,
  //       classAvg: 65, // This would ideally come from your dashboardData.subjectSummary
  //       fullMark: 100,
  //     })) || [];

  // Inside components/dashboard/StudentDeepDive.js

  // 1. Radar Chart Data mapping
  const radarData = (student.subjectBreakdown || []).map((sub) => ({
    subject: sub.subject,
    studentScore: Math.round(sub.average), // Mapping 'average' from your API
    fullMark: 100,
  }));

  // 2. Calculated Risk Display
  // Your API provides riskScore (inverse of performance)
  const currentPerformance = 100 - student.riskScore;

  // 3. Predicted Grade (using your academicScore if you decide to pass it,
  // or calculating from subjectBreakdown)
  const predictedScore = student.subjectBreakdown?.length
    ? Math.round(
        student.subjectBreakdown.reduce((a, b) => a + b.average, 0) /
          student.subjectBreakdown.length,
      )
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto bg-slate-50 border-l-0">
        <SheetHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
              {student.name?.charAt(0)}
            </div>
            <Badge
              className={`px-4 py-1 rounded-full border-none font-bold uppercase text-[10px] tracking-widest ${
                student.riskLevel === "High"
                  ? "bg-red-500 text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {student.riskLevel} Risk Profile
            </Badge>
          </div>
          <div>
            <SheetTitle className="text-3xl font-black text-slate-900">
              {student.name}
            </SheetTitle>
            <SheetDescription className="font-bold text-indigo-600 uppercase text-[10px] tracking-widest">
              Student ID: {student.studentId || "STU-8829"}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6 pb-10">
          {/* Radar Chart: Academic Balance */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-indigo-600" /> Academic
              Balance (vs Class Avg)
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                  />
                  <Radar
                    name="Student"
                    dataKey="studentScore"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Class Avg"
                    dataKey="classAvg"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Behavioral Insights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-5 rounded-[1.5rem] text-white">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
                Attendance
              </p>
              <p className="text-xl font-black">
                {student.attendanceScore || 85}%
              </p>
              <Progress
                value={student.attendanceScore}
                className="h-1 bg-white/10 mt-2"
              />
            </div>
            <div className="bg-indigo-600 p-5 rounded-[1.5rem] text-white">
              <p className="text-[9px] font-black uppercase text-indigo-200 mb-1">
                Engagement
              </p>
              <p className="text-xl font-black">Medium</p>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 w-full rounded-full ${i <= 2 ? "bg-white" : "bg-white/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* NEW: AI Prediction Component */}
          <PredictedGrade student={student} />

          {/* Specific Interventions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400">
              Recommended Next Steps
            </h4>
            {student.recommendations?.map((rec, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl group hover:border-indigo-300 transition-colors"
              >
                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">{rec}</p>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
