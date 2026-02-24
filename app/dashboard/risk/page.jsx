"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import useSWR from "swr";
import {
  LayoutDashboard,
  AlertCircle,
  Activity,
  BookOpen,
  RefreshCw,
  Search,
  ChevronRight,
  GraduationCap,
  Clock,
  Trash2,
} from "lucide-react";

// Shadcn UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Internal Components
import RiskHeatmap from "@/components/dashboard/RiskHeatmap";
import SubjectHeatmap from "@/components/dashboard/SubjectHeatmap";
import RiskTrendChart from "@/components/dashboard/RiskTrendChart";
import ClassRiskPieChart from "@/components/dashboard/ClassRiskPieChart";
import AIExplanationPanel from "@/components/dashboard/AIExplanationPanel";
import { MainLayout } from "@/components/layout/main-layout";
import StudentDeepDive from "@/components/dashboard/StudentDeepDive";

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  });

export default function RiskDashboardPage() {
  // --- 1. PERSISTENCE INITIALIZATION ---
  const [selectedClass, setSelectedClass] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("risk_center_class") || "";
    }
    return "";
  });

  const [selectedSubject, setSelectedSubject] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("risk_center_subject") || "all";
    }
    return "all";
  });

  const [lastAnalyzed, setLastAnalyzed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("risk_center_timestamp") || null;
    }
    return null;
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    students: [],
    subjectSummary: [],
    pieData: [],
    trendData: [],
  });

  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);

  const handleStudentClick = (student) => {
    setActiveStudent(student);
    setIsDeepDiveOpen(true);
  };

  // --- 2. STORAGE SYNC EFFECTS ---
  useEffect(() => {
    localStorage.setItem("risk_center_class", selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    localStorage.setItem("risk_center_subject", selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    if (lastAnalyzed) {
      localStorage.setItem("risk_center_timestamp", lastAnalyzed);
    }
  }, [lastAnalyzed]);

  // --- 3. DATA FETCHING & ANALYSIS ---
  const { data: classesRes, isLoading: classesLoading } = useSWR(
    "/api/academics/classes",
    fetcher,
    { revalidateOnFocus: false },
  );
  const classes = classesRes?.data || [];

  const handleCalculate = useCallback(
    async (targetClassId = selectedClass) => {
      if (!targetClassId) return;
      setIsCalculating(true);
      try {
        const res = await fetch("/api/risk/calculate-class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId: targetClassId }),
        });
        if (!res.ok) throw new Error("Intelligence Analysis failed");
        const data = await res.json();

        setDashboardData({
          students: data.students || [],
          subjectSummary: data.subjectSummary || [],
          pieData: data.pieData || [],
          trendData: data.trendData || [],
        });

        const now = new Date().toLocaleString();
        setLastAnalyzed(now);
        toast.success("Intelligence analysis updated.");
      } catch (err) {
        toast.error("Error running analysis.");
      } finally {
        setIsCalculating(false);
      }
    },
    [selectedClass],
  );

  // --- 4. DATA MANAGEMENT ---
  const clearSessionData = () => {
    localStorage.removeItem("risk_center_class");
    localStorage.removeItem("risk_center_subject");
    localStorage.removeItem("risk_center_timestamp");
    setSelectedClass("");
    setSelectedSubject("all");
    setLastAnalyzed(null);
    setDashboardData({
      students: [],
      subjectSummary: [],
      pieData: [],
      trendData: [],
    });
    toast.info("Command Center data reset.");
  };

  // --- 5. AUTO-LOAD EFFECT ---
  useEffect(() => {
    if (
      selectedClass &&
      dashboardData.students.length === 0 &&
      !isCalculating
    ) {
      handleCalculate(selectedClass);
    }
  }, []);

  // --- 6. DATA PROCESSING ---
  const dynamicSubjects = useMemo(
    () => dashboardData.subjectSummary,
    [dashboardData.subjectSummary],
  );

  const filteredStudents = useMemo(() => {
    const { students } = dashboardData;
    if (selectedSubject === "all") return students;

    return students.map((student) => {
      const subjectData = student.subjectBreakdown?.find(
        (s) => s.subject === selectedSubject,
      );
      if (subjectData) {
        const subjectRisk = 100 - subjectData.average;
        return {
          ...student,
          riskScore: subjectRisk,
          riskLevel:
            subjectRisk >= 70 ? "HIGH" : subjectRisk >= 40 ? "MEDIUM" : "LOW",
          isSubjectView: true,
          currentSubjectName: selectedSubject,
        };
      }
      return student;
    });
  }, [dashboardData.students, selectedSubject]);

  const stats = useMemo(() => {
    const { students, subjectSummary } = dashboardData;
    if (students.length === 0) return null;
    return {
      criticalCount: students.filter((s) => s.riskLevel === "High").length,
      avgRisk: Math.round(
        students.reduce((acc, s) => acc + s.riskScore, 0) / students.length,
      ),
      mostCriticalSubject:
        [...subjectSummary].sort((a, b) => b.averageRisk - a.averageRisk)[0]
          ?.subjectName || "N/A",
    };
  }, [dashboardData]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10 space-y-8">
        {/* Top Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Academic Intelligence
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Risk{" "}
              <span className="text-slate-400 font-light">Command Center</span>
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white p-1 sm:p-2 rounded-xl border shadow-sm">
              <Select
                value={selectedClass}
                onValueChange={(val) => {
                  setSelectedClass(val);
                  handleCalculate(val);
                }}
              >
                <SelectTrigger className="w-[150px] sm:w-[200px] bg-transparent border-none shadow-none focus:ring-0 font-medium">
                  <SelectValue
                    placeholder={classesLoading ? "Loading..." : "Select Class"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1 pr-1">
                <Button
                  onClick={() => handleCalculate()}
                  disabled={!selectedClass || isCalculating}
                  className="rounded-lg px-6 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
                >
                  {isCalculating ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Activity className="w-4 h-4 mr-2" />
                  )}
                  Analyze
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSessionData}
                  className="rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                  title="Clear Persistence Data"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* LAST ANALYZED TIMESTAMP */}
            {lastAnalyzed && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight mr-2">
                <Clock className="w-3 h-3 text-emerald-500" />
                Last Update:{" "}
                <span className="text-slate-700">{lastAnalyzed}</span>
              </div>
            )}
          </div>
        </header>

        {/* KPI Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              label="Critical Status"
              value={stats.criticalCount}
              icon={<AlertCircle />}
              trend="Requires Attention"
              color="red"
            />
            <KPICard
              label="Class Risk Index"
              value={`${stats.avgRisk}%`}
              icon={<Activity />}
              trend="Overall Performance"
              color="indigo"
            />
            <KPICard
              label="Top Risk Subject"
              value={stats.mostCriticalSubject}
              icon={<BookOpen />}
              trend="Curriculum Bottleneck"
              color="amber"
            />
          </div>
        )}

        {/* Main Dashboard Content */}
        <main className="space-y-8">
          {dashboardData.students.length > 0 ? (
            <>
              <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-white border-b px-4 flex sm:flex-row flex-col items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      Student Risk Heatmap
                    </CardTitle>
                    <CardDescription>
                      Visualizing performance gaps across the classroom
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Filter By:
                    </span>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger className="sm:w-[220px] w-[150px] bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Subjects Overview
                        </SelectItem>
                        {dynamicSubjects.map((sub) => (
                          <SelectItem
                            key={sub.subjectId}
                            value={sub.subjectName}
                          >
                            {sub.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <RiskHeatmap
                    students={filteredStudents}
                    selectedSubject={selectedSubject}
                    onStudentClick={handleStudentClick}
                    profileData={dashboardData.profileData}
                  />
                </CardContent>
              </Card>

              {selectedSubject === "all" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DashboardChartCard
                    title="Risk Trajectory"
                    description="Evolution of risk over recent exams"
                  >
                    <RiskTrendChart trendData={dashboardData.trendData} />
                  </DashboardChartCard>
                  <DashboardChartCard
                    title="Risk Distribution"
                    description="Class breakdown by risk level"
                  >
                    <ClassRiskPieChart data={dashboardData.pieData} />
                  </DashboardChartCard>
                </div>
              )}

              {selectedSubject === "all" && (
                <Card className="border-none shadow-lg rounded-[2rem]">
                  <CardHeader className="px-8 pt-8 text-center">
                    <CardTitle className="text-xl text-center font-bold">
                      Curriculum Breakdown
                    </CardTitle>
                    <CardDescription>
                      Subject-specific risk intensity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8">
                    <SubjectHeatmap subjects={dashboardData.subjectSummary} />
                  </CardContent>
                </Card>
              )}

              <AIExplanationPanel
                classId={selectedClass}
                classData={dashboardData.students}
                subjectSummary={dashboardData.subjectSummary}
              />
            </>
          ) : (
            !isCalculating && <DashboardEmptyState />
          )}
        </main>
        <StudentDeepDive
          student={activeStudent}
          isOpen={isDeepDiveOpen}
          onClose={() => setIsDeepDiveOpen(false)}
        />
      </div>
    </MainLayout>
  );
}

// --- HELPER SUB-COMPONENTS ---

function KPICard({ label, value, icon, trend, color }) {
  const themes = {
    red: "text-red-600 bg-red-50 border-red-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };
  return (
    <Card className="border-none shadow-md rounded-[2rem] overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-6 flex items-center gap-5">
        <div
          className={`p-4 rounded-2xl border transition-transform group-hover:scale-110 ${themes[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <h4 className="text-2xl font-black uppercase text-slate-900 leading-none my-1">
            {value}
          </h4>
          <p className="text-xs font-medium text-slate-500">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardChartCard({ title, description, children }) {
  return (
    <Card className="border-none shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DashboardEmptyState() {
  return (
    <div className="h-[500px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center p-10">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-50 animate-pulse" />
        <Activity className="w-16 h-16 text-indigo-400 relative" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">
        System Initialized
      </h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Please select a class from the command bar above to start the AI
        intelligence processing.
      </p>
    </div>
  );
}
