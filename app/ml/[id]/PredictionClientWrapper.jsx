// app/ml/[id]/PredictionClientWrapper.tsx
"use client";

import { useState } from "react";
import {
  TrendingDown,
  FileDown,
  BrainCircuit,
  Target,
  Info,
} from "lucide-react";
import PredictionButton from "@/lib/PredictionButton";

export default function PredictionClientWrapper({ stats }) {
  const { student, features, predictedScore, contributions, MAE, PASS_MARK } =
    stats;
  const [targetScore, setTargetScore] = useState(75);

  const isFailing = predictedScore < PASS_MARK;
  const isAtRisk =
    predictedScore >= PASS_MARK && predictedScore < PASS_MARK + MAE;

  // --- GOAL TRACKER LOGIC ---
  const gap = targetScore - predictedScore;
  const requiredBoost = gap > 0 ? (gap / 1.1).toFixed(1) : "0.0";

  // --- WEAKEST LINK LOGIC ---
  const findWeakestLink = () => {
    const values = [
      {
        name: "Attendance",
        val: features.attendance,
        impact: contributions.attendance,
        threshold: 75,
      },
      {
        name: "Unit Tests",
        val: features.unit_avg,
        impact: contributions.unit_avg,
        threshold: 60,
      },
      {
        name: "Midterm",
        val: features.midterm,
        impact: contributions.midterm,
        threshold: 60,
      },
    ];
    return values.sort(
      (a, b) => a.val - a.threshold - (b.val - b.threshold),
    )[0];
  };
  const weakest = findWeakestLink();

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white shadow-2xl rounded-[2rem] border border-gray-100 print:shadow-none print:border-none print:mt-0">
      {/* Header */}
      <header className="flex justify-between items-start border-b pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <BrainCircuit className="text-indigo-600" size={32} />
            AI Performance Report
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Academic Analysis for{" "}
            <span className="text-black font-bold">{student.name}</span> • Roll
            #{student.rollNumber}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all font-bold text-sm"
        >
          <FileDown size={18} />
          Download PDF
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
        className={`relative p-10 rounded-[2.5rem] text-center border-4 mb-8 ${
          isFailing
            ? "bg-red-50 border-red-100"
            : isAtRisk
              ? "bg-amber-50 border-amber-100"
              : "bg-indigo-50 border-indigo-100"
        }`}
      >
        <h2 className="text-xs uppercase tracking-[0.25em] font-black text-gray-400 mb-2">
          Projected Final Grade
        </h2>
        <span
          className={`text-8xl font-black tracking-tighter ${
            isFailing
              ? "text-red-700"
              : isAtRisk
                ? "text-amber-700"
                : "text-indigo-700"
          }`}
        >
          {predictedScore.toFixed(1)}%
        </span>

        <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="bg-white/60 p-3 rounded-2xl border border-white/50 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Worst Case
            </p>
            <p className="text-lg font-bold text-gray-700">
              {(predictedScore - MAE).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/60 p-3 rounded-2xl border border-white/50 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Best Case
            </p>
            <p className="text-lg font-bold text-gray-700">
              {(predictedScore + MAE).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Goal Tracker Section */}
      <section className="mb-8 p-8 bg-indigo-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden print:bg-gray-100 print:text-black">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Target size={24} className="text-indigo-400" />
              Goal Tracker
            </h3>
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] font-black uppercase px-2">
                Set Target:
              </span>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="bg-indigo-600 w-16 px-2 py-1 rounded-lg font-black text-center focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black text-indigo-400">
                  +{gap > 0 ? gap.toFixed(1) : 0}%
                </span>
                <p className="text-sm font-medium opacity-80 mb-2">
                  Required boost to reach target
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="opacity-60 uppercase font-black text-[9px]">
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
                  <p className="opacity-60 uppercase font-black text-[9px]">
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
            {/* SVG Progress Circle */}
            <div className="relative h-32 w-32 flex-shrink-0">
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
              <div className="absolute inset-0 flex items-center justify-center font-black text-lg">
                {predictedScore.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contributions and Insights */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        <div className="bg-gray-900 text-white p-6 rounded-[2rem] flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-4 text-center">
              AI Recommendation
            </h3>
            <div className="flex gap-4">
              <TrendingDown className="text-red-400 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                Prioritize <strong>{weakest.name}</strong>. A significant
                improvement here is estimated to influence the final grade by{" "}
                <strong>{Math.abs(weakest.impact).toFixed(1)} points</strong>.
              </p>
            </div>
          </div>
          <p className="text-[11px] italic text-gray-500 mt-4 border-t border-white/10 pt-4 text-center">
            "Improvement in {weakest.name} correlates highly with success."
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <details className="text-xs text-gray-400 cursor-pointer group bg-gray-50 p-4 rounded-xl">
          <summary className="font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={14} /> Model Vector Info
          </summary>
          <pre className="mt-3 p-3 bg-gray-900 text-emerald-400 rounded-lg overflow-x-auto">
            {JSON.stringify(features, null, 2)}
          </pre>
        </details>
        <PredictionButton studentId={student.id} predicted={predictedScore} />
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

function ContributionBar({ label, value, contribution }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
          {label}
        </p>
        <p className="text-lg font-bold">{value.toFixed(1)}%</p>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-bold text-gray-400 uppercase">Impact</p>
        <p className="text-xs font-black text-indigo-600">
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
      className={`mb-8 p-4 rounded-2xl flex items-center gap-4 text-white shadow-lg ${status.color}`}
    >
      <span className="text-2xl">{status.icon}</span>
      <p className="text-xl font-black">{status.label}</p>
    </div>
  );
}
