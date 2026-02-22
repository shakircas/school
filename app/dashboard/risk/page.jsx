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
} from "lucide-react";

// Shadcn UI Components (Assuming standard path)
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

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  });

export default function RiskDashboardPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isCalculating, setIsCalculating] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    students: [],
    subjectSummary: [],
    pieData: [],
    trendData: [],
  });

  // 1. Fetch Class List
  const { data: classesRes, isLoading: classesLoading } = useSWR(
    "/api/academics/classes",
    fetcher,
    { revalidateOnFocus: false },
  );
  const classes = classesRes?.data || [];

  // 2. Analysis Logic
  const handleCalculate = useCallback(async () => {
    if (!selectedClass) return;
    setIsCalculating(true);
    try {
      const res = await fetch("/api/risk/calculate-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass }),
      });
      if (!res.ok) throw new Error("Intelligence Analysis failed");
      const data = await res.json();

      setDashboardData({    
        students: data.students || [],
        subjectSummary: data.subjectSummary || [],
        pieData: data.pieData || [],
        trendData: data.trendData || [],
      });
      toast.success("Intelligence analysis updated.");
    } catch (err) {
      toast.error("Error running analysis.");
    } finally {
      setIsCalculating(false);
    }
  }, [selectedClass]);

  // 3. Dynamic Subject Extraction from Calculated Data
  // We get subjects directly from the subjectSummary array
  const dynamicSubjects = useMemo(
    () => dashboardData.subjectSummary,
    [dashboardData.subjectSummary],
  );

  // 4. Reactive Filtering Logic
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

  // 5. KPI Aggregates
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
  console.log(dashboardData);
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
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Risk{" "}
              <span className="text-slate-400 font-light">Command Center</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border shadow-sm">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0 font-medium">
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
            <Button
              onClick={handleCalculate}
              disabled={!selectedClass || isCalculating}
              className="rounded-lg px-6 bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
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
                <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      Student Risk Heatmap
                    </CardTitle>
                    <CardDescription>
                      Visualizing performance gaps across the classroom
                    </CardDescription>
                  </div>

                  {/* Dynamic Subject Switcher within the Heatmap Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Filter By:
                    </span>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger className="w-[220px] bg-slate-50 border-slate-200 rounded-xl">
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
                <CardContent className="p-8">
                  <RiskHeatmap
                    students={filteredStudents}
                    selectedSubject={selectedSubject}
                  />
                </CardContent>
              </Card>

              {selectedSubject === "all" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-xl font-bold">
                      Curriculum Breakdown
                    </CardTitle>
                    <CardDescription>
                      Subject-specific risk intensity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
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
          <h4 className="text-2xl font-black text-slate-900 leading-none my-1">
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
