"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  ArrowRight,
  Printer,
  BrainCircuit,
  CalendarDays,
  Loader2,
  AlertCircle,
  UserCircle,
  Activity,
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
import { Button } from "@/components/ui/button";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  Tooltip,
} from "recharts";
import PredictedGrade from "./PredictedGrade";
import { SmartRenderer } from "../ai/SmartRenderer";

export default function StudentDeepDive({ student, isOpen, onClose }) {
  const [aiData, setAiData] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const id = student?._id;

  // 1. Core Data Fetching
  useEffect(() => {
    if (isOpen && id) {
      setIsLoading(true);
      fetch(`/api/students/${id}/report`)
        .then((res) => res.json())
        .then((json) => {
          setAiData(json);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [id, isOpen]);

  // 2. AI Analysis Fetching (Triggered when aiData is ready)
  useEffect(() => {
    if (isOpen && aiData?.profile) {
      const fetchAIReport = async () => {
        setIsAnalyzing(true);
        try {
          const response = await fetch(`/api/students/${id}/ai-report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentData: aiData.profile }),
          });
          const data = await response.json();
          setAiReport(data);
        } catch (error) {
          console.error("AI Analysis failed:", error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      fetchAIReport();
    }
  }, [isOpen, aiData?.profile, id]);

  if (!student) return null;

  // Clean Variable Declarations
  const profile = aiData?.profile || {};
  const studentInfo = profile?.student || student;
  const recommendations = aiData?.recommendations || [];

  // Data for Radar Chart
  const radarData = (
    profile?.subjectBreakdown ||
    student.subjectBreakdown ||
    []
  ).map((sub) => ({
    subject: sub.subject,
    studentScore: Math.round(sub.average),
    fullMark: 100,
  }));

  const handlePrint = () => window.print();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl p-0 overflow-y-auto bg-slate-50/50 backdrop-blur-xl border-l-0 sheet-content-print-target">
        {/* Print Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            .no-print { display: none !important; }
            .sheet-content-print-target { 
              position: absolute; 
              left: 0; top: 0; 
              width: 100%; 
              background: white !important; 
            }
            body { background: white; }
          }
        `,
          }}
        />

        {/* Top Accent Bar */}
        <div
          className={`h-1.5 w-full sticky top-0 z-50 ${profile.riskLevel === "High" ? "bg-red-500" : "bg-indigo-600"}`}
        />

        <div className="p-6 space-y-8">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-slate-200">
                  {studentInfo.name?.charAt(0)}
                </div>
                <div>
                  <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                    {studentInfo.name}
                  </SheetTitle>
                  <SheetDescription className="font-bold text-indigo-600 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    Roll: {studentInfo.rollNumber} • Reg:{" "}
                    {studentInfo.registrationNumber}
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  </SheetDescription>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 no-print">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-full h-8 text-[10px] font-bold uppercase tracking-wider border-slate-200 hover:bg-white"
                >
                  <Printer className="w-3 h-3 mr-2" /> Print Report
                </Button>
                <Badge
                  className={`px-4 py-1 rounded-full border-none font-bold uppercase text-[9px] tracking-widest ${
                    profile.riskLevel === "High"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {profile.riskLevel || student.riskLevel} Risk
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Stats Bento Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Attendance"
              value={profile.attendanceScore || 0}
              color="text-slate-900"
              icon={<CalendarDays className="w-3 h-3" />}
            />
            <StatCard
              label="Academic"
              value={profile.academicScore || 0}
              color="text-slate-900"
              icon={<TrendingUp className="w-3 h-3" />}
            />
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg shadow-indigo-100">
              <p className="text-[8px] font-black uppercase text-indigo-200 mb-1">
                Risk Factor
              </p>
              <p className="text-lg font-black">
                {profile.finalRiskScore || 0}%
              </p>
              <div className="flex gap-1 mt-2">
                <div
                  className={`h-1 w-full rounded-full bg-white ${profile.finalRiskScore > 40 ? "opacity-100" : "opacity-30"}`}
                />
                <div
                  className={`h-1 w-full rounded-full bg-white ${profile.finalRiskScore > 70 ? "opacity-100" : "opacity-30"}`}
                />
              </div>
            </div>
          </div>

          {/* Subject History Sparklines */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Subject Performance Trends
            </h4>
            <div className="grid grid-cols-1 gap-6">
              {(profile.subjectBreakdown || []).map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="w-24 shrink-0">
                    <p className="text-[10px] font-black uppercase text-slate-500 truncate">
                      {sub.subject}
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {sub.average}%
                    </p>
                  </div>
                  <div className="h-10 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          sub.history || [
                            { val: 40 },
                            { val: 60 },
                            { val: sub.average },
                          ]
                        }
                      >
                        <Line
                          type="monotone"
                          dataKey="val"
                          stroke={sub.average < 40 ? "#ef4444" : "#6366f1"}
                          strokeWidth={2.5}
                          dot={false}
                        />
                        <YAxis hide domain={[0, 100]} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Radar Chart & Predicted Grade Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                <UserCircle className="w-3 h-3" /> Performance Radar
              </h4>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 9, fontWeight: 800, fill: "#94a3b8" }}
                    />
                    <Radar
                      name="Student"
                      dataKey="studentScore"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <PredictedGrade student={profile} />
          </div>

          {/* Intervention Roadmap */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2">
              <Target className="w-3 h-3" /> Recommended Intervention Roadmap
            </h4>
            <div className="grid gap-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-[1.5rem] hover:border-indigo-400 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                      {rec}
                    </p>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic px-2">
                  No specific interventions logged.
                </p>
              )}
            </div>
          </div>

          {/* AI Deep Dive Analysis (Always at the bottom) */}
          <div className="bg-white p-5 rounded-[2rem] border border-indigo-100 shadow-sm pb-10">
            <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> AI Deep Dive Diagnostics
            </h4>

            {isAnalyzing ? (
              <div className="flex flex-col items-center py-10 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                  Analyzing student trajectory...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiReport?.insights?.map((insight, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start border-l-2 border-indigo-50 pl-4 py-1 hover:border-indigo-500 transition-colors"
                  >
                    <SmartRenderer content={insight} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-12 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center space-y-4">
                <div className="h-px bg-slate-300 w-full" />
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Class Teacher Signature
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-px bg-slate-300 w-full" />
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Parent Signature
                </p>
              </div>
            </div>
            <p className="text-center text-[8px] text-slate-300 mt-8 italic">
              Report generated via Intelligence Analytics on{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">
          {label}
        </p>
        <div className="text-slate-300">{icon}</div>
      </div>
      <div>
        <p className={`text-xl font-black ${color} tracking-tight`}>
          {Math.round(value)}%
        </p>
        <Progress value={value} className="h-1 bg-slate-100 mt-2" />
      </div>
    </div>
  );
}
