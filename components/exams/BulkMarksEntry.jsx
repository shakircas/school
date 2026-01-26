"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Printer,
  Save,
  CheckCircle2,
  ClipboardList,
  Loader2,
  FileUp,
  FileDown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../ui/page-header";
import * as XLSX from "xlsx";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function BulkMarksEntry() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({ pass: 0, fail: 0, total: 0 });

  // API Data
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const { data: studentsRes } = useSWR(
    classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null,
    fetcher,
  );

  const [marksData, setMarksData] = useState({});

  const students = studentsRes?.students || [];
  const subjects = subjectsRes?.data || [];
  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];

  const leftColumn = students.slice(0, 22);
  const rightColumn = students.slice(22, 44);

  const handleMarkChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        isAbsent:
          field === "obtained" && value.toLowerCase() === "abs"
            ? true
            : prev[studentId]?.isAbsent,
      },
    }));
  };

  const handleClear = () => {
    if (Object.keys(marksData).length === 0) return;
    const confirmClear = window.confirm("Clear all unsaved changes?");
    if (confirmClear) {
      setMarksData({});
      toast.info("Grid cleared");
    }
  };

  const downloadTemplate = () => {
    if (students.length === 0 || !subjectId) {
      return toast.error("Please select a Class and Subject first");
    }
    const selectedSub = subjects.find((s) => s._id === subjectId);
    const templateData = students.map((s) => ({
      "Roll Number": s.rollNumber,
      "Student Name": s.name,
      "Student ID (Do Not Edit)": s._id,
      Subject: selectedSub?.name,
      "Total Marks": 100,
      "Obtained Marks": "",
      "Is Absent": "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Entry");
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
    ];
    XLSX.writeFile(workbook, `${selectedSub?.name}_Template.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const newMarksData = {};

        jsonData.forEach((row) => {
          const studentId = row["Student ID (Do Not Edit)"];
          if (studentId) {
            const absentText = row["Is Absent"]?.toString().toLowerCase();
            const isAbsent = absentText === "yes" || absentText === "true";
            newMarksData[studentId] = {
              total: Number(row["Total Marks"]) || 100,
              obtained: isAbsent ? 0 : Number(row["Obtained Marks"]) || 0,
              isAbsent: isAbsent,
            };
          }
        });
        setMarksData(newMarksData);
        toast.success(
          `Imported marks for ${Object.keys(newMarksData).length} students`,
        );
      } catch (error) {
        toast.error("Excel Parse Error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSave = async () => {
    if (!subjectId || !examId || !classId)
      return toast.error("Please select all filters");
    if (Object.keys(marksData).length === 0)
      return toast.error("No marks entered to save");

    setIsSaving(true);
    try {
      const selectedSubject = subjects.find((s) => s._id === subjectId);
      const payload = {
        examId,
        classId,
        sectionId,
        subjectName: selectedSubject?.name,
        results: Object.entries(marksData).map(([id, val]) => ({
          studentId: id,
          obtainedMarks: Number(val.obtained || 0),
          totalMarks: Number(val.total || 100),
          isAbsent: val.isAbsent || false,
        })),
      };

      const res = await fetch("/api/results/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const total = payload.results.length;
        const pass = payload.results.filter(
          (r) => r.obtainedMarks >= r.totalMarks * 0.33,
        ).length;
        setSummary({ total, pass, fail: total - pass });
        setShowSummary(true);
        toast.success("Marks synchronized successfully");
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bulk Marks Entry"
        description="2026 Academic Session - Award List Management"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={Object.keys(marksData).length === 0}
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={!classId || !subjectId}
          >
            <FileDown className="h-4 w-4 mr-2" /> Template
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={!classId}
            />
            <Button variant="secondary" disabled={!classId}>
              <FileUp className="h-4 w-4 mr-2" /> Import
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button
            onClick={handleBulkSave}
            disabled={isSaving || !classId}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}{" "}
            Save Marks
          </Button>
        </div>
      </PageHeader>

      <Card className="print:hidden border-none shadow-sm bg-slate-50">
        <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {classId && students.length > 0 ? (
        <div className="flex justify-center pb-10">
          <div
            className="award-list-print bg-white shadow-2xl p-[10mm]"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <div className="text-center mb-6 border-b-2 border-black pb-2">
              <h1 className="text-2xl font-bold uppercase">
                Award List - 2026
              </h1>
              <p className="text-sm">
                Exam: {exams.find((e) => e._id === examId)?.name} | Subject:{" "}
                {subjects.find((s) => s._id === subjectId)?.name.toUpperCase()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {[leftColumn, rightColumn].map((colStudents, colIdx) => (
                <div key={colIdx}>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead className="bg-slate-100 uppercase">
                      <tr>
                        <th className="border border-black p-1 w-8">R#</th>
                        <th className="border border-black p-1 text-left">
                          Student Name
                        </th>
                        <th className="border border-black p-1 w-12">Max</th>
                        <th className="border border-black p-1 w-16">Obt.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colStudents.map((s) => (
                        <tr
                          key={s._id}
                          className={`h-8 group ${marksData[s._id] ? "bg-blue-50/50" : ""}`}
                        >
                          <td className="border border-black text-center font-bold">
                            {s.rollNumber}
                          </td>
                          <td className="border border-black px-2 uppercase truncate">
                            {s.name}
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              className="w-full h-full text-center bg-transparent outline-none"
                              value={marksData[s._id]?.total || ""}
                              placeholder="100"
                              onChange={(e) =>
                                handleMarkChange(s._id, "total", e.target.value)
                              }
                            />
                          </td>
                          <td className="border border-black">
                            <input
                              type="text"
                              className={`w-full h-full text-center font-bold bg-transparent outline-none ${marksData[s._id]?.isAbsent ? "text-red-600" : ""}`}
                              value={
                                marksData[s._id]?.isAbsent
                                  ? "ABS"
                                  : marksData[s._id]?.obtained || ""
                              }
                              onChange={(e) =>
                                handleMarkChange(
                                  s._id,
                                  "obtained",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-400 font-medium">
            Select criteria to load the Award List
          </p>
        </div>
      )}

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Save Complete
            </DialogTitle>
            <DialogDescription>
              Performance summary for{" "}
              {subjects.find((s) => s._id === subjectId)?.name}:
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 uppercase">Total</p>
              <p className="text-xl font-bold">{summary.total}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <p className="text-xs text-emerald-600 uppercase">Pass</p>
              <p className="text-xl font-bold text-emerald-700">
                {summary.pass}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 uppercase">Fail</p>
              <p className="text-xl font-bold text-red-700">{summary.fail}</p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="w-full"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Final Award List
            </Button>
            <Button onClick={() => setShowSummary(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
