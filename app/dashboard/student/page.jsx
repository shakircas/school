"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Target,
  CalendarDays,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentDashboard() {
  const { data: session } = useSession();

  // Use session ID or fallback to your test ID
  //   const studentId = session?.user?.id || "695600dbb2869ac41c465d56";
  const studentId = "695600dbb2869ac41c465d56";

  const { data: planRes, isLoading } = useSWR(
    studentId ? `/api/adaptive/generate-plan?studentId=${studentId}` : null,
    fetcher,
  );

  const activePlan = planRes?.aiPlan || planRes?.plan;

  // Calculate high-level progress for the dashboard preview
  const stats = (() => {
    if (!activePlan?.tasks) return { percent: 0, completed: 0, total: 0 };
    const total = activePlan.tasks.length;
    const completed = activePlan.tasks.filter((t) => t.completed).length;
    return {
      percent: Math.round((completed / total) * 100),
      completed,
      total,
    };
  })();

  if (isLoading) return <LoadingState />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Welcome Header */}
          <header className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              Learning Overview
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Hello, {session?.user?.name?.split(" ")[0] || "Scholar"}! 👋
            </h1>
            <p className="text-slate-500 font-medium">
              Your personalized recovery track is ready for review.
            </p>
          </header>

          {/* Primary Call to Action: Mastery Hub Link */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 shadow-2xl shadow-indigo-200 group">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-widest">
                  <BrainCircuit className="w-4 h-4" />
                  AI Adaptive Pathway
                </div>
                <h2 className="text-3xl font-black text-white leading-tight">
                  Enter your <br /> Mastery Hub
                </h2>
                <p className="text-indigo-100 text-sm max-w-sm font-medium">
                  Bridge your knowledge gaps with a sequence optimized
                  specifically for your performance.
                </p>
              </div>

              <Link
                href={`/dashboard/adaptive/${studentId}`}
                className="flex items-center justify-center gap-3 bg-white text-indigo-600 px-8 py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
              >
                RESUME LEARNING
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Decorative background icon */}
            <BrainCircuit className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
          </div>

          {/* Quick Progress Preview */}
          {activePlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-2xl">
                      <Target className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="font-black text-slate-800 uppercase tracking-tight">
                      Recovery Status
                    </span>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">
                    {stats.percent}%
                  </span>
                </div>
                <Progress value={stats.percent} className="h-3 bg-slate-100" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                  {stats.completed} of {stats.total} Mastery Points Secured
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="p-4 bg-indigo-50 rounded-[1.8rem]">
                  <CalendarDays className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Schedule
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    7-Day Roadmap
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    Subject-wise optimization active
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Tasks Preview (Summary) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              Next Steps
            </h3>
            <div className="space-y-3">
              {activePlan?.tasks?.slice(0, 3).map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs">
                      D{task.day}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {task.topic}
                      </p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                        {task.subject}
                      </p>
                    </div>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  ) : (
                    <Zap className="text-slate-200 w-5 h-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-white flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
        Loading Dashboard...
      </p>
    </div>
  );
}
