"use client";

import { useState } from "react";
import {
  TrendingDown,
  FileDown,
  BrainCircuit,
  Target,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import PredictionButton from "@/lib/PredictionButton";

export default function PredictionClientWrapper({ stats }) {
  const { student, features, predictedScore, contributions, MAE, PASS_MARK } =
    stats;
  const [targetScore, setTargetScore] = useState(75);

  const [simulatedAttendance, setSimulatedAttendance] = useState(
    features.attendance,
  );
  const [simulatedMidterm, setSimulatedMidterm] = useState(features.midterm);

  // Calculate Simulated Prediction
  // Formula: Original Prediction + (New Value - Original Value) * (Impact / Original Value)
  const calcSimulatedScore = () => {
    const attendanceDiff =
      (simulatedAttendance - features.attendance) *
      (contributions.attendance / (features.attendance || 1));
    const midtermDiff =
      (simulatedMidterm - features.midterm) *
      (Math.abs(contributions.midterm) / (features.midterm || 1));

    return Math.min(
      100,
      Math.max(0, predictedScore + attendanceDiff + midtermDiff),
    ).toFixed(1);
  };

  const simulatedTotal = calcSimulatedScore();




  const isFailing = predictedScore < PASS_MARK;
  const isAtRisk =
    predictedScore >= PASS_MARK && predictedScore < PASS_MARK + MAE;

  const gap = targetScore - predictedScore;
  const requiredBoost = gap > 0 ? (gap / 1.1).toFixed(1) : "0.0";

  // Inside PredictionClientWrapper.tsx

  // 1. Find the most damaging factor based on the contribution (the most negative number)
  const findWeakestLink = () => {
    const list = [
      {
        name: "Attendance",
        impact: contributions.attendance,
        val: features.attendance,
      },
      { name: "Midterm", impact: contributions.midterm, val: features.midterm },
      {
        name: "Unit Tests",
        impact: contributions.unit_avg,
        val: features.unit_avg,
      },
      {
        name: "Previous Exam",
        impact: contributions.previous_exam,
        val: features.previous_exam,
      },
    ];

    // Sort by impact ascending (lowest/most negative number first)
    return list.sort((a, b) => a.impact - b.impact)[0];
  };

  const weakest = findWeakestLink();

  // 2. Modified ContributionBar to handle colors
  function ContributionBar({ label, value, contribution }) {
    const isPositive = contribution > 0;

    return (
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
            {label}
          </p>
          <p className="text-lg font-bold">{value.toFixed(1)}%</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[8px] font-bold text-gray-400 uppercase">Impact</p>
          <p
            className={`text-xs sm:text-sm font-black ${isPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {contribution.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  // Inside PredictionClientWrapper.tsx
  const trendData = [
    { name: "Unit Avg", score: features.unit_avg, average: 65 }, // 'average' can be a hardcoded class mean
    { name: "Midterm", score: features.midterm, average: 60 },
    { name: "Prev Exam", score: features.previous_exam, average: 62 },
    { name: "PREDICTED", score: predictedScore, average: 60 },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-8 mt-4 sm:mt-10 bg-white shadow-xl sm:shadow-2xl rounded-3xl sm:rounded-[2rem] border border-gray-100 print:shadow-none print:border-none print:mt-0">
      {/* Header - Stack on mobile */}
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-6 mb-8">
        <div>
          <h1 className="text-xl sm:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
            <BrainCircuit className="text-indigo-600 shrink-0" size={28} />
            AI Performance Report
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
            Analysis for{" "}
            <span className="text-black font-bold">{student.name}</span> • Roll
            #{student.rollNumber}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-all font-bold text-sm"
        >
          <FileDown size={18} />
          Export PDF
        </button>
      </header>

      <RiskAnalysisBanner
        isFailing={isFailing}
        isAtRisk={isAtRisk}
        score={predictedScore}
        mae={MAE}
      />

      {/* Prediction Hero */}
      <div
        className={`relative p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] text-center border-2 sm:border-4 mb-8 ${
          isFailing
            ? "bg-red-50 border-red-100"
            : isAtRisk
              ? "bg-amber-50 border-amber-100"
              : "bg-indigo-50 border-indigo-100"
        }`}
      >
        <h2 className="text-xs sm:text-md uppercase tracking-[0.2em] font-black text-gray-400 mb-2">
          Projected Final Grade
        </h2>
        <span
          className={`text-5xl sm:text-8xl font-black tracking-tighter block ${
            isFailing
              ? "text-red-700"
              : isAtRisk
                ? "text-amber-700"
                : "text-indigo-700"
          }`}
        >
          {predictedScore.toFixed(1)}%
        </span>

        {/* Worst/Best Case grid - 1 col on tiny mobile, 2 on others */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto">
          <div className="bg-white/60 p-3 rounded-2xl border border-white/50">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">
              Worst Case
            </p>
            <p className="text-base sm:text-lg font-bold text-gray-700">
              {(predictedScore - MAE).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/60 p-3 rounded-2xl border border-white/50">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">
              Best Case
            </p>
            <p className="text-base sm:text-lg font-bold text-gray-700">
              {(predictedScore + MAE).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Goal Tracker Section */}
      <section className="mb-8 p-6 sm:p-8 bg-indigo-900 text-white rounded-3xl sm:rounded-[2.5rem] shadow-xl relative overflow-hidden print:bg-gray-100 print:text-black">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <Target size={20} className="text-indigo-400" />
              Goal Tracker
            </h3>
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/10 w-full sm:w-auto">
              <span className="text-[9px] font-black uppercase px-1 whitespace-nowrap">
                Set Target:
              </span>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="bg-indigo-600 w-full sm:w-16 px-2 py-1 rounded-lg font-black text-center focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
            <div className="flex-1 w-full">
              <div className="flex flex-col items-center md:items-start mb-4">
                <span className="text-4xl sm:text-5xl font-black text-indigo-400">
                  +{gap > 0 ? gap.toFixed(1) : 0}%
                </span>
                <p className="text-xs font-medium opacity-80">
                  Required boost to reach target
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="opacity-60 uppercase font-black text-[8px] sm:text-[9px]">
                    Attendance Target
                  </p>
                  <p className="font-bold text-sm">
                    {Math.min(
                      100,
                      features.attendance + Number(requiredBoost),
                    ).toFixed(0)}
                    %
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="opacity-60 uppercase font-black text-[8px] sm:text-[9px]">
                    Unit Test Target
                  </p>
                  <p className="font-bold text-sm">
                    {Math.min(
                      100,
                      features.unit_avg + Number(requiredBoost),
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>
            </div>
            {/* SVG Circle - Centered on mobile */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-white/10 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-indigo-400 stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${(predictedScore / 100) * 264} 264`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-base sm:text-lg">
                {predictedScore.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border-2 border-indigo-100 shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Strategy Simulator
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Adjust values to see potential impact on final grade
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {/* Attendance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <label className="text-gray-600">Attendance</label>
                <span className="text-indigo-600">{simulatedAttendance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedAttendance}
                onChange={(e) => setSimulatedAttendance(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Midterm Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <label className="text-gray-600">Midterm Score</label>
                <span className="text-indigo-600">{simulatedMidterm}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedMidterm}
                onChange={(e) => setSimulatedMidterm(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Simulation Result Display */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-100 text-center shadow-sm">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
              Simulated Outcome
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-black text-gray-900">
                {simulatedTotal}%
              </span>
              {Number(simulatedTotal) > predictedScore && (
                <span className="text-emerald-500 text-sm font-bold">
                  (+{(Number(simulatedTotal) - predictedScore).toFixed(1)})
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">
              Based on current model weightings
            </p>
          </div>
        </div>
      </section>

      {/* Contributions grid - 1 col on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="space-y-3">
          <ContributionBar
            label="Attendance"
            value={features.attendance}
            contribution={contributions.attendance}
          />
          <ContributionBar
            label="Midterm"
            value={features.midterm}
            contribution={contributions.midterm}
          />
          <ContributionBar
            label="Unit Avg"
            value={features.unit_avg}
            contribution={contributions.unit_avg}
          />
        </div>

        {/* <div className="bg-gray-900 text-white p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-indigo-400 font-black uppercase text-[9px] tracking-widest mb-3 text-center sm:text-left">
              AI Recommendation
            </h3>
            <div className="flex gap-3">
              <TrendingDown className="text-red-400 shrink-0" size={20} />
              <p className="text-xs sm:text-sm leading-relaxed">
                Prioritize <strong>{weakest.name}</strong>. A significant
                improvement here influences the final grade by{" "}
                <strong>{Math.abs(weakest.impact).toFixed(1)} points</strong>.
              </p>
            </div>
          </div>
          <p className="text-[10px] italic text-gray-500 mt-4 border-t border-white/10 pt-4 text-center">
            "Improvement in {weakest.name} correlates highly with success."
          </p>
        </div> */}

        <div className="bg-gray-900 text-white p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-indigo-400 font-black uppercase text-[9px] tracking-widest mb-3 text-center sm:text-left">
              AI Recommendation
            </h3>
            <div className="flex gap-3">
              {/* Icon changes based on if the weakest link is negative */}
              <TrendingDown className="text-red-400 shrink-0" size={20} />
              <p className="text-xs sm:text-sm leading-relaxed">
                The student's performance in <strong>{weakest.name}</strong> is
                the primary factor dragging down the prediction. Focusing on
                this area could improve the final grade by up to{" "}
                <strong>{Math.abs(weakest.impact).toFixed(1)} points</strong>.
              </p>
            </div>
          </div>
          <p className="text-[10px] italic text-gray-500 mt-4 border-t border-white/10 pt-4 text-center">
            "Targeted intervention in {weakest.name} is highly recommended."
          </p>
        </div>
      </div>

      {/* Performance Trend Analysis */}
      <section className="mb-8 p-4 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm print:border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900">
              <TrendingDown size={24} className="text-indigo-600 rotate-180" />
              Academic Growth Trend
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Evolution of Performance
            </p>
          </div>

          {/* Trend Indicator Badge */}
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              predictedScore > features.previous_exam
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {predictedScore > features.previous_exam
              ? "↗ Improving"
              : "↘ Declining"}
          </div>
        </div>

        <div className="h-[250px] sm:h-[300px] w-full -ml-4 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#6b7280" }}
                dy={10}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                width={30}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                cursor={{ stroke: "#4f46e5", strokeWidth: 2 }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorScore)"
                animationDuration={1500}
                dot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />

              <Area
                type="monotone"
                dataKey="average"
                stroke="#d1d5db"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 border-t border-gray-50 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">
            <span className="h-2 w-6 rounded-full bg-indigo-600"></span>
            Student Progress
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">
            <span className="h-0 w-6 border-t-2 border-dashed border-gray-300"></span>
            Class Average
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <details className="text-[10px] sm:text-xs text-gray-400 cursor-pointer group bg-gray-50 p-4 rounded-xl">
          <summary className="font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={14} /> Model Vector Info
          </summary>
          <pre className="mt-3 p-3 bg-gray-900 text-emerald-400 rounded-lg overflow-x-auto text-[10px] leading-tight">
            {JSON.stringify(features, null, 2)}
          </pre>
        </details>
        <div className="w-full">
          <PredictionButton studentId={student.id} predicted={predictedScore} />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Subcomponents with responsive touch
function ContributionBar({ label, value, contribution }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center transition-colors hover:bg-white hover:shadow-sm">
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest truncate">
          {label}
        </p>
        <p className="text-base sm:text-lg font-bold">{value.toFixed(1)}%</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[8px] font-bold text-gray-400 uppercase">Impact</p>
        <p className="text-xs sm:text-sm font-black text-indigo-600">
          +{contribution.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function RiskAnalysisBanner({ isFailing, isAtRisk, score, mae }) {
  const status = isFailing
    ? { color: "bg-red-600", label: "Critical Risk", icon: "⚠️" }
    : isAtRisk
      ? { color: "bg-amber-500", label: "Borderline", icon: "💡" }
      : { color: "bg-emerald-600", label: "On Track", icon: "✅" };

  return (
    <div
      className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 text-white shadow-lg ${status.color}`}
    >
      <span className="text-xl sm:text-2xl">{status.icon}</span>
      <p className="text-lg sm:text-xl font-black">{status.label}</p>
    </div>
  );
}
