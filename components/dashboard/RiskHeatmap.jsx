"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpRight, User, AlertCircle, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function RiskHeatmap({
  students = [],
  selectedSubject = "all",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const isSubjectView = selectedSubject !== "all";

  const processedStudents = useMemo(() => {
    return students
      .map((student) => {
        if (isSubjectView) {
          // Robust matching for subjectId or Name
          const subjectData = student.subjectBreakdown?.find(
            (sub) =>
              sub.subject === selectedSubject ||
              sub.subjectId === selectedSubject,
          );

          if (subjectData) {
            const subRisk = Math.round(100 - subjectData.average);
            return {
              ...student,
              displayScore: subRisk,
              displayLevel:
                subRisk >= 70 ? "High" : subRisk >= 40 ? "Medium" : "Low",
              isMissingSubject: false,
            };
          }
          // If student hasn't taken this subject, flag them
          return {
            ...student,
            displayScore: 0,
            displayLevel: "N/A",
            isMissingSubject: true,
          };
        }

        return {
          ...student,
          displayScore: student.riskScore || 0,
          displayLevel: student.riskLevel || "Low",
          isMissingSubject: false,
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

  const getRiskStyles = (risk, isMissing) => {
    if (isMissing)
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        accent: "bg-slate-300",
        text: "text-slate-400",
      };
    if (risk >= 70)
      return {
        bg: "bg-rose-50/40",
        border: "border-rose-100",
        accent: "bg-rose-500",
        text: "text-rose-600",
      };
    if (risk >= 40)
      return {
        bg: "bg-amber-50/40",
        border: "border-amber-100",
        accent: "bg-amber-500",
        text: "text-amber-600",
      };
    return {
      bg: "bg-emerald-50/40",
      border: "border-emerald-100",
      accent: "bg-emerald-500",
      text: "text-emerald-600",
    };
  };

  return (
    <div className="space-y-8 mt-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-[1.5rem] border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search student profile..."
            className="pl-10 border-none bg-slate-50 rounded-xl focus-visible:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {["All", "High", "Medium", "Low"].map((level) => (
            <button
              key={level}
              onClick={() => setActiveFilter(level)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeFilter === level
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {processedStudents.length > 0 ? (
            processedStudents.map((student) => {
              const styles = getRiskStyles(
                student.displayScore,
                student.isMissingSubject,
              );
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={student._id}
                  className={`group bg-white rounded-3xl border-2 ${styles.border} p-5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <Badge
                      variant="outline"
                      className={`${styles.bg} ${styles.text} border-none font-black text-[9px] px-2 py-1 uppercase tracking-widest`}
                    >
                      {student.displayLevel}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-slate-800 flex items-center gap-1">
                        {student.name}
                        <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {isSubjectView
                          ? "Subject Performance"
                          : "Cohort Status"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black">
                        <span className="text-slate-400 uppercase">
                          Risk Score
                        </span>
                        <span className={styles.text}>
                          {student.displayScore}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${styles.accent}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${student.displayScore}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
              <FilterX className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">
                No students found matching your criteria
              </p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
