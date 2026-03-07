"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  PlusCircle,
  GraduationCap,
  BookOpen,
  User,
  BarChart3,
  Loader2,
  SearchX,
  Database,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you use Sonner for toasts

export default function TopicPerformancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState("");
  const [attempts, setAttempts] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  // --- Data Fetching ---
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  const { data: studentsRes } = useSWR(
    selectedClass ? `/api/students?class=${selectedClass}` : null,
    fetcher,
  );
  const students = studentsRes?.students || [];

  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const subjects = subjectsRes?.data || [];

  const {
    data: performance,
    mutate,
    isValidating,
  } = useSWR(
    selectedStudent
      ? `/api/topic-performance?student=${selectedStudent}`
      : null,
    fetcher,
  );

  // --- Logic & Stats ---
  const stats = useMemo(() => {
    if (!performance || performance.length === 0) return { avg: 0, count: 0 };
    const avg =
      performance.reduce((acc, curr) => acc + curr.masteryLevel, 0) /
      performance.length;
    return { avg: Math.round(avg), count: performance.length };
  }, [performance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation: Ensure no empty values are sent as 0
    if (!score || !attempts || !chapter || !topic) {
      return toast.error("Please fill in all fields");
    }

    const numScore = Number(score);
    if (numScore > 100 || numScore < 0) {
      return toast.error("Score must be between 0-100");
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/topic-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: selectedStudent,
          subject: selectedSubject,
          chapter,
          topic,
          score: Number(score),
          attempts: Number(attempts),
        }),
      });

      toast.success("Mastery record updated successfully");
      setChapter("");
      setTopic("");
      setScore("");
      setAttempts("");
      mutate();
    } catch (err) {
      toast.error("Failed to save record");
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
              <TrendingUp className="w-4 h-4" /> Academic Intelligence
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              TOPIC MASTERY ENGINE
            </h1>
            <p className="text-slate-500 font-medium">
              Granular curriculum performance tracking for adaptive recovery
              plans.
            </p>
          </div>

          {selectedStudent && (
            <div className="flex gap-4">
              <HeaderStat
                label="Topics Logged"
                value={stats.count}
                icon={<Database className="w-4 h-4" />}
              />
              <HeaderStat
                label="Avg. Mastery"
                value={`${stats.avg}%`}
                icon={<Award className="w-4 h-4" />}
              />
            </div>
          )}
        </header>

        {/* Global Selectors */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectGroup
            label="Classroom"
            icon={<GraduationCap className="w-4 h-4" />}
            value={selectedClass}
            onChange={(val) => {
              setSelectedClass(val);
              setSelectedStudent("");
            }}
            options={classes}
            placeholder="Select Class"
          />
          <SelectGroup
            label="Student"
            icon={<User className="w-4 h-4" />}
            value={selectedStudent}
            onChange={setSelectedStudent}
            options={students}
            placeholder="Select Student"
            disabled={!selectedClass}
          />
          <SelectGroup
            label="Subject Area"
            icon={<BookOpen className="w-4 h-4" />}
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={subjects}
            placeholder="Select Subject"
            useNameAsValue
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <PlusCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Log Mastery
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputGroup
                  label="Chapter / Module"
                  value={chapter}
                  onChange={setChapter}
                  placeholder="e.g. Chapter 01"
                  required
                />
                <InputGroup
                  label="Topic Name"
                  value={topic}
                  onChange={setTopic}
                  placeholder="e.g. Kinetic Theory"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Score (%)"
                    type="number"
                    value={score}
                    onChange={setScore}
                    placeholder="0-100"
                    required
                  />
                  <InputGroup
                    label="Attempts"
                    type="number"
                    value={attempts}
                    onChange={setAttempts}
                    placeholder="1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !selectedStudent || !selectedSubject}
                  className="group w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black transition-all disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-3 mt-6 shadow-lg shadow-slate-200 active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Database className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  )}
                  COMMIT TO DATABASE
                </button>
              </form>
            </div>
          </div>

          {/* Performance Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Performance Stream
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Historical Data
                  </p>
                </div>
                {isValidating && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              {!selectedStudent ? (
                <EmptyState
                  icon={<User className="w-16 h-16" />}
                  text="Select a student to initialize engine"
                />
              ) : performance?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                        <th className="px-8 py-5">Syllabus Breakdown</th>
                        <th className="px-8 py-5">Performance Metrics</th>
                        <th className="px-8 py-5 text-right">Mastery Flux</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {performance.map((item) => (
                        <tr
                          key={item._id}
                          className="group hover:bg-blue-50/30 transition-all"
                        >
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                {item.subject}
                              </span>
                              <span className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                                {item.topic}
                              </span>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <BookOpen className="w-3 h-3" /> {item.chapter}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center w-32">
                                <span className="text-[10px] font-black text-slate-400 uppercase">
                                  Score
                                </span>
                                <span className="text-sm font-black text-slate-700">
                                  {item.score}%
                                </span>
                              </div>
                              <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${item.score < 50 ? "bg-red-500" : "bg-emerald-500"}`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {item.attempts} Trials Logged
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <MasteryBadge level={item.masteryLevel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<SearchX className="w-16 h-16" />}
                  text="No mastery records found for this profile"
                />
              )}
            </div>

            {/* Call to Action: Redirect to Adaptive Plan */}
            {selectedStudent && (
              <Button
                onClick={() =>
                  router.push(`/dashboard/adaptive/${selectedStudent}`)
                }
                className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-4 group"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                    Next Phase
                  </p>
                  <p className="text-lg font-black text-white">
                    GENERATE ADAPTIVE STUDY PLAN
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// --- Specialized Components ---

function HeaderStat({ label, value, icon }) {
  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-xl text-blue-600">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
          {label}
        </p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function MasteryBadge({ level }) {
  const config =
    level < 50
      ? {
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-100",
          label: "Critical",
        }
      : level < 80
        ? {
            bg: "bg-amber-50",
            text: "text-amber-600",
            border: "border-amber-100",
            label: "Proficient",
          }
        : {
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            border: "border-emerald-100",
            label: "Master",
          };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <div
        className={`px-4 py-2 rounded-xl font-black text-base border ${config.bg} ${config.text} ${config.border}`}
      >
        {level}%
      </div>
      <span
        className={`text-[8px] font-black uppercase tracking-widest ${config.text}`}
      >
        {config.label}
      </span>
    </div>
  );
}

function SelectGroup({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  useNameAsValue,
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-2">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={opt._id} value={useNameAsValue ? opt.name : opt._id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputGroup({ label, onChange, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
        {label}
      </label>
      <input
        {...props}
        // Extract the value from the event here
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
      />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-200">
      <div className="mb-4 opacity-20">{icon}</div>
      <p className="font-black text-sm uppercase tracking-[0.2em] text-slate-400 text-center max-w-[200px] leading-relaxed">
        {text}
      </p>
    </div>
  );
}
