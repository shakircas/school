"use client";

import { useState, useMemo } from "react";
import {
  Search,
  GraduationCap,
  ArrowUpRight,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RiskHeatmap({
  students = [],
  selectedSubject = "all",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Determine if we are in Subject-Specific mode
  const isSubjectView = selectedSubject !== "all";

  const processedStudents = useMemo(() => {
    return students
      .map((student) => {
        // If a subject is selected, override the overall risk with the subject-specific risk
        if (isSubjectView) {
          const subjectData = student.subjectBreakdown?.find(
            (sub) =>
              sub.subject === selectedSubject ||
              sub.subjectId === selectedSubject,
          );

          if (subjectData) {
            // Risk is typically inverse of the average (100 - average)
            const subRisk = Math.round(100 - subjectData.average);
            return {
              ...student,
              displayScore: subRisk,
              displayLevel:
                subRisk >= 70 ? "High" : subRisk >= 40 ? "Medium" : "Low",
            };
          }
        }
        // Default to overall risk
        return {
          ...student,
          displayScore: student.riskScore,
          displayLevel: student.riskLevel,
        };
      })
      .filter((student) => {
        const matchesSearch = student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesFilter =
          activeFilter === "All" || student.displayLevel === activeFilter;
        return matchesSearch && matchesFilter;
      });
  }, [searchTerm, activeFilter, students, selectedSubject, isSubjectView]);

  const getRiskStyles = (risk) => {
    if (risk >= 70)
      return {
        bg: "bg-red-50/50",
        border: "border-red-200",
        accent: "bg-red-600",
        text: "text-red-700",
        label: "Critical",
      };
    if (risk >= 40)
      return {
        bg: "bg-amber-50/50",
        border: "border-amber-200",
        accent: "bg-amber-500",
        text: "text-amber-700",
        label: "Warning",
      };
    return {
      bg: "bg-emerald-50/50",
      border: "border-emerald-200",
      accent: "bg-emerald-600",
      text: "text-emerald-700",
      label: "Stable",
    };
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={`Search ${processedStudents.length} students...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {["All", "High", "Medium", "Low"].map((level) => (
              <button
                key={level}
                onClick={() => setActiveFilter(level)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeFilter === level
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {processedStudents.map((student) => {
            const styles = getRiskStyles(student.displayScore);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={student._id}
                className={`group relative overflow-hidden p-5 rounded-2xl border ${styles.bg} ${styles.border} transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${styles.accent}`}
                />

                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border ${styles.border} ${styles.text}`}
                    >
                      {student.displayLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                      {student.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {isSubjectView
                        ? `Risk in ${selectedSubject.name}`
                        : "Overall Risk Factor"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-slate-100">
                    <div className="flex-1 h-2 bg-slate-200/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${student.displayScore}%` }}
                        className={`h-full ${styles.accent}`}
                      />
                    </div>
                    <span className={`text-sm font-black ${styles.text}`}>
                      {student.displayScore}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
