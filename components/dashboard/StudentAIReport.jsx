"use client";

import React, { useRef } from "react";
import {
  BrainCircuit,
  AlertCircle,
  TrendingDown,
  Clock,
  Lightbulb,
  Printer,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function StudentAIReport({ reportData }) {
  const reportRef = useRef(null);

  if (!reportData || !reportData.profile) return null;

  const {
    profile,
    aiInsights = [],
    recommendations = [],
    generatedAt,
  } = reportData;

  // Visualizing the Academic Trajectory
  const mockTrendData = [
    { name: "Term 1", score: profile.academicScore - 8 },
    { name: "Term 2", score: profile.academicScore + 4 },
    { name: "Current", score: profile.academicScore },
  ];

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Report_${profile.student?.name.replace(/\s+/g, "_")}.pdf`);
  };

  console.log(profile);

  const getRiskColor = (level) => {
    const levels = {
      High: "text-red-700 bg-red-50 border-red-200",
      Medium: "text-amber-700 bg-amber-50 border-amber-200",
      Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
    return levels[level] || "text-slate-700 bg-slate-50 border-slate-200";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Interactive Controls */}
      <div className="flex justify-between items-center print:hidden px-2">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Analytics Dashboard
        </h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl border-slate-200"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200"
          >
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Capture Container */}
      <div
        ref={reportRef}
        className="p-8 bg-slate-50 rounded-[3rem] print:bg-white print:p-0"
        id="report-content"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black">
                {profile.student?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-none mb-2">
                  {profile.student?.name.toUpperCase()}
                </h1>

                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {profile.student?._id?.toString().slice(-12).toUpperCase()} •{" "}
                  {new Date(generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge
              className={`px-6 py-2 rounded-xl text-xs font-black border uppercase ${getRiskColor(profile.riskLevel)}`}
            >
              {profile.riskLevel} Risk
            </Badge>
            <Card
              className={`px-6 py-2 rounded-xl text-xs font-black border uppercase ${getRiskColor(profile.riskLevel)}`}
            >
              {profile?.finalRiskScore} Risk Score
            </Card>
          </div>

          {/* Visualization Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-indigo-600" /> Academic
                  Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        fontWeight: "bold",
                      }}
                    />
                    <ReferenceLine
                      y={45}
                      stroke="#fda4af"
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        fill: "#4f46e5",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats Column */}
            <div className="space-y-4">
              {[
                {
                  label: "Attendance",
                  val: profile.attendanceScore,
                  icon: Clock,
                  color: "text-blue-600",
                },
                {
                  label: "Academic Avg",
                  val: profile.academicScore,
                  icon: BrainCircuit,
                  color: "text-purple-600",
                },
                {
                  label: "Trend Score",
                  val: profile.trendScore,
                  icon: TrendingDown,
                  color: "text-orange-600",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col items-center justify-center text-center"
                >
                  <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-slate-800">
                    {Math.round(stat.val)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights & Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[2rem] bg-slate-900 text-white">
              <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Risk Synthesis
              </h3>
              <div className="space-y-3">
                {aiInsights.map((text, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs italic text-slate-300"
                  >
                    <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    "{text}"
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-indigo-600 text-white">
              <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-300" /> Intervention
                Plan
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-white text-indigo-900 rounded-2xl font-bold text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] shrink-0">
                      {i + 1}
                    </div>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem]">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6">
              Academic Integrity Matrix
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              {profile.subjectBreakdown.map((sub) => (
                <div key={sub.subject} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-500">{sub.subject}</span>
                    <span
                      className={
                        sub.average < 40 ? "text-red-600" : "text-slate-800"
                      }
                    >
                      {Math.round(sub.average)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.average < 40 ? "bg-red-500" : "bg-indigo-600"}`}
                      style={{ width: `${sub.average}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signature Lines (Hidden in UI, visible in PDF/Print) */}
          <div className="grid grid-cols-2 gap-10 pt-10 mt-6 border-t border-slate-100 hidden print:grid">
            <div className="border-t border-slate-300 pt-2">
              <p className="text-[9px] font-black uppercase text-slate-400">
                Class Teacher Signature
              </p>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <p className="text-[9px] font-black uppercase text-slate-400">
                Parent/Guardian Acknowledgment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
