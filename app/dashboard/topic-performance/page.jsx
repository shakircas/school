"use client";

import { useState } from "react";
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
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function TopicPerformancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState("");
  const [attempts, setAttempts] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Data
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch("/api/topic-performance", {
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

      setChapter("");
      setTopic("");
      setScore("");
      setAttempts("");
      mutate();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <BarChart3 className="text-blue-600 w-8 h-8" />
              TOPIC MASTERY ENGINE
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Log and monitor student performance across granular curriculum
              topics.
            </p>
          </div>
        </div>

        {/* Selectors Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectGroup
            label="Class"
            icon={<GraduationCap className="w-4 h-4" />}
            value={selectedClass}
            onChange={setSelectedClass}
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
            label="Subject"
            icon={<BookOpen className="w-4 h-4" />}
            value={selectedSubject}
            onChange={(val) => setSelectedSubject(val)}
            options={subjects}
            placeholder="Select Subject"
            useNameAsValue
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Log New Entry
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputGroup
                  label="Chapter"
                  value={chapter}
                  onChange={setChapter}
                  placeholder="e.g. Chapter 01"
                  required
                />
                <InputGroup
                  label="Topic"
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
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                  Save Record
                </button>
              </form>
            </div>
          </div>

          {/* Data Table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  Performance Records
                </h2>
                {isValidating && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              <div className="overflow-x-auto">
                {!selectedStudent ? (
                  <EmptyState
                    icon={<User className="w-12 h-12" />}
                    text="Select a student to view performance history"
                  />
                ) : performance?.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Topic Info</th>
                        <th className="px-6 py-4">Assessment</th>
                        <th className="px-6 py-4 text-right">Mastery Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {performance.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">
                                {item.subject}
                              </span>
                              <span className="font-bold text-slate-800">
                                {item.topic}
                              </span>
                              <span className="text-xs text-slate-400">
                                {item.chapter}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <span className="font-bold text-slate-700">
                                {item.score}%
                              </span>
                              <span className="text-slate-400 ml-1">
                                ({item.attempts} attempts)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <MasteryBadge level={item.masteryLevel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState
                    icon={<SearchX className="w-12 h-12" />}
                    text="No topic records found for this student"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// --- Helper Components ---

function MasteryBadge({ level }) {
  const config =
    level < 40
      ? { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" }
      : level < 70
        ? {
            bg: "bg-amber-50",
            text: "text-amber-600",
            border: "border-amber-100",
          }
        : {
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            border: "border-emerald-100",
          };

  return (
    <span
      className={`px-4 py-1.5 rounded-xl font-black text-xs border ${config.bg} ${config.text} ${config.border}`}
    >
      {level}%
    </span>
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
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
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

function InputGroup({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
      {icon}
      <p className="mt-4 font-bold text-sm uppercase tracking-widest">{text}</p>
    </div>
  );
}
