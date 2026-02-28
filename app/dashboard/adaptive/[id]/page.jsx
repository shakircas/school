"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Trophy,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  LayoutDashboard,
} from "lucide-react";
import { SmartRenderer } from "@/components/ai/SmartRenderer";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";

export default function AdaptivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    const fetchExistingPlan = async () => {
      try {
        const res = await fetch(`/api/adaptive/generate-plan?studentId=${id}`);
        const result = await res.json();
        if (result.plan || result.aiPlan) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch existing plan", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingPlan();
  }, [id]);

  const activePlan = data?.aiPlan || data?.plan;

  const groupedTasks = useMemo(() => {
    if (!activePlan?.tasks) return {};
    return activePlan.tasks.reduce((acc, task) => {
      if (!acc[task.subject]) acc[task.subject] = [];
      acc[task.subject].push(task);
      return acc;
    }, {});
  }, [activePlan]);

  const progressMetrics = useMemo(() => {
    if (!activePlan?.tasks) return { percent: 0, completed: 0, total: 0 };
    const total = activePlan.tasks.length;
    const completed = activePlan.tasks.filter((t) => t.completed).length;
    return { percent: Math.round((completed / total) * 100), completed, total };
  }, [activePlan]);

  const toggleSubject = (subject) => {
    setExpandedSubjects((prev) => ({ ...prev, [subject]: !prev[subject] }));
  };

  const handleDownloadCertificate = (subject) => {
    // Triggers the download by opening the API route in a new tab/window
    window.open(
      `/api/adaptive/certificate?subject=${encodeURIComponent(subject)}&studentId=${id}`,
      "_blank",
    );
  };
  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/adaptive/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id }),
      });
      const result = await res.json();
      setData(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = async (taskId, currentState) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch("/api/adaptive/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: !currentState }),
      });
      const result = await res.json();
      if (result.success) {
        const updatedData = { ...data };
        const planKey = data.aiPlan ? "aiPlan" : "plan";
        updatedData[planKey] = result.plan;
        setData(updatedData);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <header className="flex flex-col gap-6 rounded-[2.5rem] bg-white p-6 shadow-sm border border-slate-200 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-600 p-2.5 shadow-lg shadow-indigo-100">
                  <BrainCircuit className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                  Mastery Hub
                </h1>
              </div>
              <p className="text-slate-500 font-medium ml-1">
                Identity:{" "}
                <span className="text-indigo-600 font-bold">{id}</span>
              </p>
            </div>
            <button
              onClick={generatePlan}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-black disabled:bg-slate-200 active:scale-95 shadow-xl shadow-slate-200"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {activePlan ? "REFINE ROADMAP" : "GENERATE PATHWAY"}
            </button>
          </header>

          {/* Top Cards */}
          {activePlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProgressCard
                label="Total Progress"
                value={`${progressMetrics.percent}%`}
                subtext="Overall Mastery"
                icon={<Zap className="text-amber-500 w-5 h-5" />}
              />
              <ProgressCard
                label="Knowledge Areas"
                value={Object.keys(groupedTasks).length}
                subtext="Active Subjects"
                icon={<BookOpen className="text-blue-500 w-5 h-5" />}
              />
              <ProgressCard
                label="Board Status"
                value={
                  progressMetrics.percent === 100 ? "Verified" : "Learning"
                }
                subtext="Readiness Level"
                icon={<Trophy className="text-indigo-500 w-5 h-5" />}
              />
            </div>
          )}

          {/* Subject Feed */}
          {activePlan ? (
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([subject, tasks]) => {
                const subjectCompleted = tasks.filter(
                  (t) => t.completed,
                ).length;
                const subjectPercent = Math.round(
                  (subjectCompleted / tasks.length) * 100,
                );
                const isExpanded = expandedSubjects[subject] !== false;
                const isMastered = subjectPercent === 100;

                return (
                  <section
                    key={subject}
                    className={`bg-white rounded-[2.5rem] border shadow-sm overflow-hidden transition-all ${isMastered ? "border-emerald-200 ring-4 ring-emerald-500/5" : "border-slate-200"}`}
                  >
                    {/* Subject Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => toggleSubject(subject)}
                      >
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${isMastered ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}
                        >
                          {isMastered ? (
                            <Award className="w-6 h-6" />
                          ) : (
                            subject.charAt(0)
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                            {subject}
                          </h2>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {subjectPercent}% Completed
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-slate-300 w-5 h-5" />
                        ) : (
                          <ChevronDown className="text-slate-300 w-5 h-5" />
                        )}
                      </div>

                      {/* Certificate Button */}
                      {isMastered && (
                        <button
                          onClick={() => handleDownloadCertificate(subject)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all animate-in zoom-in duration-300"
                        >
                          <Download className="w-4 h-4" />
                          Mastery Certificate
                        </button>
                      )}
                    </div>

                    {/* Task List */}
                    {isExpanded && (
                      <div className="p-6 pt-0 space-y-4">
                        {tasks.map((task) => (
                          <div
                            key={task._id}
                            className={`group flex gap-4 p-5 rounded-3xl border transition-all ${task.completed ? "bg-emerald-50/40 border-emerald-100" : "bg-white border-slate-100 hover:border-indigo-200"}`}
                          >
                            <button
                              onClick={() =>
                                toggleTask(task._id, task.completed)
                              }
                              disabled={updatingId === task._id}
                              className="shrink-0 pt-1"
                            >
                              {updatingId === task._id ? (
                                <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                              ) : task.completed ? (
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                              ) : (
                                <Circle className="w-8 h-8 text-slate-200 group-hover:text-indigo-300" />
                              )}
                            </button>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                  Day {task.day || "1"}
                                </span>
                                {task.completed && (
                                  <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                                    Mastered
                                  </span>
                                )}
                              </div>
                              <h4
                                className={`text-lg font-bold leading-tight ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}
                              >
                                {task.topic}
                              </h4>
                              {!task.completed && (
                                <div className="text-sm text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 mt-2">
                                  <SmartRenderer
                                    content={task.taskDescription}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            !isGenerating && <EmptyState />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// --- Internal UI ---

function ProgressCard({ label, value, subtext, icon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase">
          {subtext}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-white flex-col gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] animate-pulse">
        Syncing Academy Data
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-24 text-center">
      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <LayoutDashboard className="h-10 w-10 text-slate-200" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">No Roadmap Found</h3>
      <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
        Initiate the AI engine to generate a subject-specific recovery plan.
      </p>
    </div>
  );
}
