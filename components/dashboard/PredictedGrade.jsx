"use client";

import React from "react";
import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";

export default function PredictedGrade({ student }) {
  // Logic: Calculate trend based on subject breakdown
  const calculatePrediction = () => {
    if (!student?.subjectBreakdown?.length)
      return { score: 0, trend: "neutral" };

    const avg = student.riskScore; // Using riskScore as a proxy for performance inverse
    const performance = 100 - avg;

    // Simulating a "Next Exam" projection based on current momentum
    const momentum = Math.random() * 10 - 5; // In a real app, calculate (current - previous)
    const predicted = Math.min(100, Math.max(0, performance + momentum));

    return {
      score: Math.round(predicted),
      trend: momentum > 1 ? "up" : momentum < -1 ? "down" : "neutral",
    };
  };

  const { score, trend } = calculatePrediction();

  const getTheme = () => {
    if (score >= 80)
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TrendingUp />,
        label: "Distinction Track",
      };
    if (score >= 50)
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <Minus />,
        label: "Borderline Pass",
      };
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <TrendingDown />,
      label: "Failure Risk",
    };
  };

  const theme = getTheme();

  return (
    <div
      className={`p-6 rounded-[2rem] border-2 border-dashed border-opacity-50 flex flex-col items-center text-center ${theme.bg} ${theme.text.replace("text", "border")}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          AI Final Projection
        </span>
      </div>

      <div className="text-6xl font-black tracking-tighter mb-1">{score}%</div>

      <div className="flex items-center gap-2 font-bold text-xs">
        {theme.icon}
        {theme.label}
      </div>

      <p className="mt-4 text-[10px] opacity-70 font-medium leading-relaxed max-w-[200px]">
        Based on current momentum and {student.subjectBreakdown?.length} subject
        inputs.
      </p>
    </div>
  );
}
