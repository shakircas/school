"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileSpreadsheet, FileText, Trophy } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel } from "@/lib/excel-utils";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function ResultsDownloadsContent() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectSection, setSelectSection] = useState("all");
  const [selectAcademicYear, setSelectAcademicYear] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: exams } = useSWR("/api/exams", fetcher);
  const query = new URLSearchParams({
    examId: selectedExam,
    classId: selectedClass,
    sectionId: selectSection,
    academicYear: selectAcademicYear,
  }).toString();

  const { data: results, isLoading } = useSWR(
    selectedExam ? `/api/results?${query}` : null,
    fetcher
  );

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const classes = classesRes?.data || [];
  console.log(results);

  const handleExport = async (format) => {
    if (!results?.length) {
      toast.error("No results to export");
      return;
    }

    setIsExporting(true);
    try {
      const data = results?.map((r) => {
        const percentage = (r.obtainedMarks / r.totalMarks) * 100;

        return {
          "Student Name": r.student?.name || "",
          "Roll Number": r.student?.rollNumber || "",
          Class: r.student?.classId || r.classId.name,
          Section: r.student?.sectionId || r.classId.section,
          Exam: r.exam?.name || "",
          "Obtained Marks": r.obtainedMarks,
          "Total Marks": r.totalMarks,
          Percentage: percentage.toFixed(2) + "%",
          Grade: getGrade(percentage),
          Status: percentage >= 33 ? "Pass" : "Fail",
        };
      });

      if (format === "csv") {
        exportToCSV(data, `results_${selectedExam}`);
      } else {
        exportToExcel(data, `results_${selectedExam}`);
      }

      toast.success(`Exported ${data.length} results`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download Results"
        description="Export exam results and reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Data</CardTitle>
            <CardDescription>Choose exam and class to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class (Optional)</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Examination</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.data?.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - Class {exam.classId.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section (Optional)</Label>
              <Select value={selectSection} onValueChange={setSelectSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {classes
                    .find((c) => c._id === selectedClass)
                    ?.sections?.map((s) => (
                      <SelectItem key={s._id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Academic Year (Optional)</Label>
              <Select
                value={selectAcademicYear}
                onValueChange={setSelectAcademicYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2021-2022">2021-2022</SelectItem>
                  <SelectItem value="2020-2021">2020-2021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && <LoadingSpinner />}

            <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{results?.length || 0} results found</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Download results in your preferred format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => handleExport("csv")}
              disabled={isExporting || !selectedExam}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>

            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting || !selectedExam}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Included Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Student Name & Roll Number</li>
                <li>Class & Section</li>
                <li>Obtained & Total Marks</li>
                <li>Percentage & Grade</li>
                <li>Pass/Fail Status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
