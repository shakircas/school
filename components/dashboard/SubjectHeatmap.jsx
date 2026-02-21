"use client";

import {
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SubjectHeatmap({ subjects = [] }) {
  const getStatusDetails = (risk) => {
    if (risk >= 70)
      return {
        text: "text-rose-600",
        bg: "bg-rose-50",
        bar: "bg-rose-500",
        border: "border-rose-100",
        indicator: "Critical Intervention",
        pulse: "animate-pulse",
      };
    if (risk >= 40)
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        bar: "bg-amber-500",
        border: "border-amber-100",
        indicator: "Monitor Closely",
        pulse: "",
      };
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      border: "border-emerald-100",
      indicator: "On Track",
      pulse: "",
    };
  };

  return (
    <div className="space-y-8 mt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="mb-2 bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1"
          >
            Curriculum Intelligence
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Subject <span className="text-slate-400">Heatmap</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md mt-1">
            Identify which specific academic areas are causing the highest risk
            across the class cohort.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {subjects.map((subject, index) => {
            const status = getStatusDetails(subject.averageRisk);

            return (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-none shadow-lg shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div
                        className={`p-3 rounded-2xl ${status.bg} ${status.pulse}`}
                      >
                        <BookOpen className={`w-5 h-5 ${status.text}`} />
                      </div>
                      <Badge
                        className={`${status.bg} ${status.text} ${status.border} border shadow-none capitalize rounded-lg px-2 text-[10px]`}
                      >
                        {status.indicator}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-800">
                        {subject.subjectName}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Visual Risk Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Risk Intensity
                        </span>
                        <span className={`text-lg font-black ${status.text}`}>
                          {subject.averageRisk}%
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          className={`h-full rounded-full ${status.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.averageRisk}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Meta Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            At Risk
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-700">
                          {subject.atRiskCount}{" "}
                          <span className="font-medium text-slate-400 text-[10px]">
                            Students
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Focus
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-700">
                          {subject.averageRisk > 60 ? "Immediate" : "Normal"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
