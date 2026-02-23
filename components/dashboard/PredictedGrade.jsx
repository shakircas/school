"use client";

import React from "react";
import {
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PredictedGrade({ student }) {
  if (!student) return null;

  // Calculate Average from Subject Breakdown
  const avgScore = student.subjectBreakdown?.length
    ? student.subjectBreakdown.reduce((a, b) => a + b.average, 0) /
      student.subjectBreakdown.length
    : student.academicScore || 0;

  // Logic for Grade Mapping
  const getGrade = (score) => {
    if (score >= 90)
      return { letter: "A+", color: "text-emerald-500", label: "Exceptional" };
    if (score >= 80)
      return { letter: "A", color: "text-blue-500", label: "Outstanding" };
    if (score >= 70)
      return { letter: "B", color: "text-indigo-500", label: "Good" };
    if (score >= 60)
      return { letter: "C", color: "text-amber-500", label: "Average" };
    if (score >= 50)
      return { letter: "D", color: "text-orange-500", label: "Below Average" };
    return { letter: "F", color: "text-red-500", label: "Critical Risk" };
  };

  const grade = getGrade(avgScore);

  // Confidence is inversely proportional to risk score
  const confidence = 100 - (student.riskScore || 0);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col gap-4 justify-between">
      {/* Background Decoration */}
      <div className="absolute -right-4 -top-8 opacity-[0.03]">
        <Target className="w-32 h-32 text-slate-900" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-500" /> AI Term Projection
          </h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3 h-3 text-slate-300" />
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white text-[10px] p-2 border-none">
                Calculation based on current subject average and trend data.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-baseline gap-4">
          <span
            className={`text-6xl font-black tracking-tighter ${grade.color}`}
          >
            {grade.letter}
          </span>
          <div>
            <p className="text-xs font-bold text-slate-700">{grade.label}</p>
            <p className="text-[10px] font-medium text-slate-400">
              Current Projected Grade
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
              Prediction Confidence
            </p>
            <p className="text-xs font-bold text-slate-600">{confidence}%</p>
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] font-black uppercase ${confidence > 70 ? "text-emerald-500" : "text-amber-500"}`}
          >
            <TrendingUp className="w-3 h-3" />
            {confidence > 70 ? "High Accuracy" : "Variable"}
          </div>
        </div>

        <Progress
          value={confidence}
          className={`h-1.5 bg-slate-100 [&>div]:${confidence > 70 ? "bg-emerald-500" : "bg-amber-500"}`}
        />

        {confidence < 60 && (
          <div className="flex items-center gap-2 mt-2 bg-amber-50 p-2 rounded-xl border border-amber-100">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
            <p className="text-[9px] font-bold text-amber-700 leading-tight">
              Low attendance is making this projection volatile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
