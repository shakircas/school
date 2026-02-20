"use client";

import { BookOpen, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectHeatmap({ subjects = [] }) {
  const getStatusColor = (risk) => {
    if (risk >= 70)
      return {
        text: "text-red-600",
        bg: "bg-red-50",
        bar: "bg-red-500",
        border: "border-red-100",
        indicator: "Critical",
      };
    if (risk >= 40)
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        bar: "bg-amber-500",
        border: "border-amber-100",
        indicator: "Moderate",
      };
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      border: "border-emerald-100",
      indicator: "Healthy",
    };
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Subject Criticality Analysis
          </h2>
          <p className="text-sm text-slate-500">
            Aggregated risk metrics across the curriculum
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => {
          const status = getStatusColor(subject.averageRisk);

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={subject.subjectId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Header: Subject Name & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-lg ${status.bg}`}>
                  <BookOpen className={`w-5 h-5 ${status.text}`} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border} uppercase tracking-wider`}
                >
                  {status.indicator}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {subject.subjectName}
              </h3>

              <div className="space-y-4">
                {/* Risk Bar Component */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Average Risk
                    </span>
                    <span className={`text-sm font-bold ${status.text}`}>
                      {subject.averageRisk}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.averageRisk}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${status.bar}`}
                    />
                  </div>
                </div>

                {/* Sub-metrics Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-md">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">
                        Struggling
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {subject.atRiskCount}{" "}
                        <span className="text-[10px] font-medium text-slate-400">
                          Students
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">
                        Focus Level
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {subject.averageRisk > 60 ? "Immediate" : "Standard"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
