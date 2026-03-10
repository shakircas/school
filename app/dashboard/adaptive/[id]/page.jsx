"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  AlertCircle,
  X,
} from "lucide-react";
import { SmartRenderer } from "@/components/ai/SmartRenderer";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";
import { toast } from "sonner"; // Assuming sonner or similar for production-grade toasts

export default function AdaptivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [userAnswer, setUserAnswer] = useState({});
  const [masteryContent, setMasteryContent] = useState({});
  const [isGeneratingMastery, setIsGeneratingMastery] = useState(null);

  // Memoized Fetch for stability
  const fetchExistingPlan = useCallback(async () => {
    try {
      const res = await fetch(`/api/adaptive/generate-plan?studentId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      if (result.plan || result.aiPlan) {
        setData(result);
      }
    } catch (err) {
      toast.error("Could not sync roadmap data.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExistingPlan();
  }, [fetchExistingPlan]);

  // Generation Logic for Mastery
  const generateMasteryContent = async (task) => {
    if (masteryContent[task._id]) return; // Avoid redundant calls
    setIsGeneratingMastery(task._id);

    try {
      const res = await fetch("/api/adaptive/mastery-content", {
        method: "POST",
        body: JSON.stringify({
          topic: task.topic,
          studentId: id,
          subject: task.subject,
        }),
      });

      if (!res.ok) throw new Error("Briefing failed");
      const result = await res.json();
      setMasteryContent((prev) => ({ ...prev, [task._id]: result.content }));
      toast.success("Mastery Briefing generated!");
    } catch (err) {
      toast.error("AI service is busy. Try again shortly.");
    } finally {
      setIsGeneratingMastery(null);
    }
  };

  // Data Selectors
  const activePlan = useMemo(() => data?.aiPlan || data?.plan, [data]);

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

  // Handlers
  const toggleSubject = (subject) => {
    setExpandedSubjects((prev) => ({ ...prev, [subject]: !prev[subject] }));
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
        setData((prev) => ({
          ...prev,
          [data.aiPlan ? "aiPlan" : "plan"]: result.plan,
        }));
      }
    } catch (err) {
      toast.error("Failed to update task status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-3 py-6 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Production Header */}
          <header className="flex flex-col gap-6 rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-sm border border-slate-200 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-600 p-2.5 shadow-lg shadow-indigo-100">
                  <BrainCircuit className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                  Mastery Hub
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium ml-1">
                Student ID:{" "}
                <span className="text-indigo-600 font-bold">{id}</span>
              </p>
            </div>
            <button
              onClick={() => !isGenerating && generatePlan()}
              disabled={isGenerating}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-black disabled:bg-slate-200 active:scale-95 shadow-xl shadow-slate-200 text-sm sm:text-base"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {activePlan ? "REFINE ROADMAP" : "GENERATE PATHWAY"}
            </button>
          </header>

          {/* Stats Grid */}
          {activePlan && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <ProgressCard
                label="Total Progress"
                value={`${progressMetrics.percent}%`}
                subtext="Overall Mastery"
                icon={<Zap className="text-amber-500 w-5 h-5" />}
              />
              <ProgressCard
                label="Subjects"
                value={Object.keys(groupedTasks).length}
                subtext="Active Areas"
                icon={<BookOpen className="text-blue-500 w-5 h-5" />}
              />
              <div className="sm:col-span-2 md:col-span-1">
                <ProgressCard
                  label="Board Status"
                  value={
                    progressMetrics.percent === 100 ? "Ready" : "In Review"
                  }
                  subtext="BISE Preparation"
                  icon={<Trophy className="text-indigo-500 w-5 h-5" />}
                />
              </div>
            </div>
          )}

          {/* Main Feed */}
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
                    className={`bg-white rounded-[2rem] border transition-all duration-300 ${isMastered ? "border-emerald-200 ring-8 ring-emerald-500/5" : "border-slate-200 shadow-sm"}`}
                  >
                    {/* Subject Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                      <div
                        className="flex items-center gap-4 cursor-pointer w-full group"
                        onClick={() => toggleSubject(subject)}
                      >
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-colors ${isMastered ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50"}`}
                        >
                          {isMastered ? (
                            <Award className="w-6 h-6" />
                          ) : (
                            subject.charAt(0)
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-black uppercase text-slate-800">
                            {subject}
                          </h2>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${subjectPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {subjectPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto p-2 rounded-full hover:bg-slate-50">
                          {isExpanded ? (
                            <ChevronUp className="text-slate-300" />
                          ) : (
                            <ChevronDown className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Task List */}
                    {isExpanded && (
                      <div className="px-6 pb-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {tasks.map((task) => (
                          <div
                            key={task._id}
                            className={`p-5 rounded-3xl border transition-all ${task.completed ? "bg-emerald-50/30 border-emerald-100" : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"}`}
                          >
                            <div className="flex flex-col md:flex-row gap-5">
                              <div className="flex items-start gap-4">
                                <button
                                  onClick={() =>
                                    toggleTask(task._id, task.completed)
                                  }
                                  disabled={updatingId === task._id}
                                  className="mt-1 transition-transform active:scale-90"
                                >
                                  {updatingId === task._id ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                  ) : task.completed ? (
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                  ) : (
                                    <Circle className="w-8 h-8 text-slate-200 hover:text-indigo-300" />
                                  )}
                                </button>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                      Day {task.day || "1"}
                                    </span>
                                    {!task.completed && (
                                      <button
                                        onClick={() =>
                                          generateMasteryContent(task)
                                        }
                                        disabled={
                                          isGeneratingMastery === task._id
                                        }
                                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-tighter transition-all shadow-sm"
                                      >
                                        {isGeneratingMastery === task._id ? (
                                          <Loader2
                                            size={10}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Sparkles size={10} />
                                        )}
                                        Master Topic
                                      </button>
                                    )}
                                  </div>
                                  <h4
                                    className={`text-lg font-bold ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}
                                  >
                                    {task.topic}
                                  </h4>
                                </div>
                              </div>
                            </div>

                            {/* Adaptive Study Content Render */}
                            {!task.completed && (
                              <div className="mt-4 ml-12 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                                <SmartRenderer content={task.taskDescription} />
                              </div>
                            )}

                            {/* Mastery Briefing Section */}
                            {masteryContent[task._id] && (
                              <div className="mt-6 ml-0 md:ml-12 p-6 bg-white border-2 border-indigo-100 rounded-[2rem] shadow-xl shadow-indigo-50/50 animate-in zoom-in-95 duration-300 relative">
                                <button
                                  onClick={() =>
                                    setMasteryContent((prev) => ({
                                      ...prev,
                                      [task._id]: null,
                                    }))
                                  }
                                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                                >
                                  <X size={16} />
                                </button>

                                <div className="flex items-center gap-2 mb-6">
                                  <div className="p-2 bg-indigo-50 rounded-xl">
                                    <BrainCircuit
                                      size={18}
                                      className="text-indigo-600"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                      AI Study Intelligence
                                    </span>
                                    <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-tighter">
                                      Level-Adjusted Briefing
                                    </h5>
                                  </div>
                                </div>

                                <div className="prose prose-slate prose-sm max-w-none mb-8">
                                  <SmartRenderer
                                    content={masteryContent[task._id]}
                                  />
                                </div>

                                {/* Interactive MCQ Section */}
                                <div className="pt-6 border-t border-slate-100">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Zap
                                      size={14}
                                      className="text-amber-500 fill-amber-500"
                                    />
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                      Self-Assessment Checkpoint
                                    </span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="w-full">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">
                                        Your Answer
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Type A, B, C or D"
                                        maxLength={1}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm font-bold uppercase transition-all"
                                        value={userAnswer[task._id] || ""}
                                        onChange={(e) =>
                                          setUserAnswer({
                                            ...userAnswer,
                                            [task._id]:
                                              e.target.value.toUpperCase(),
                                          })
                                        }
                                      />
                                    </div>
                                    <button className="h-[46px] px-8 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                                      Verify
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
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

        {/* Floating Mobile Progress - Optimized for visibility */}
        {activePlan && (
          <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:hidden">
            <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Hub Progress
                </span>
                <span className="text-xs font-black text-white">
                  {progressMetrics.percent}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${progressMetrics.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Sub-components (Production grade)

function ProgressCard({ label, value, subtext, icon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:translate-y-[-2px]">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 tabular-nums">
          {value}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
          {subtext}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-white flex-col gap-6">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <div className="absolute inset-0 h-12 w-12 animate-ping bg-indigo-100 rounded-full -z-10" />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-black text-[10px] text-slate-900 uppercase tracking-[0.3em]">
          Syncing Academy Data
        </p>
        <p className="text-[9px] text-slate-400 font-bold uppercase">
          Optimizing Roadmap for Board Exams
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-24 px-6 text-center shadow-inner">
      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
        <LayoutDashboard className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
        No Roadmap Found
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mt-3 font-medium">
        Your personalized AI study pathway is ready to be built. Click generate
        to start.
      </p>
    </div>
  );
}
