"use client";

import { useState, useMemo, useEffect } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
import { Printer, Save, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function BulkMarksEntry() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const [subject, setSubject] = useState("");
  const [examId, setExamId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Store marks in state: { studentId: { obtained: number, total: number } }
  const [marksData, setMarksData] = useState({});

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  
  const studentsUrl = classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null;
  const { data: studentsRes } = useSWR(studentsUrl, fetcher);

  const students = studentsRes?.students || [];
  const classes = classesRes?.data || [];
  const exams = examsRes?.data || [];

  const leftColumn = students.slice(0, 22);
  const rightColumn = students.slice(22, 44);

  // Handle Input Changes
  const handleMarkChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleBulkSave = async () => {
    if (!subject || !examId) {
      toast.error("Please select Exam and enter Subject name");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        examId,
        classId,
        sectionId,
        subject,
        results: Object.entries(marksData).map(([studentId, data]) => ({
          studentId,
          obtainedMarks: Number(data.obtained),
          totalMarks: Number(data.total),
        })),
      };

      const res = await fetch("/api/results/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save marks");
      toast.success("All marks saved successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Marks Entry" description="Enter and save marks for the entire class">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" /> Print Blank
          </Button>
          <Button onClick={handleBulkSave} disabled={isSaving || !classId} className="bg-emerald-600 hover:bg-emerald-700">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Marks
          </Button>
        </div>
      </PageHeader>

      {/* Selectors */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Exam" /></SelectTrigger>
            <SelectContent>
              {exams.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
            </SelectContent>
          </Select>

          <input 
            type="text" 
            placeholder="Subject Name" 
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Entry Sheet */}
      {classId && students.length > 0 ? (
        <div className="flex justify-center pb-10">
          <div className="award-list-print bg-white shadow-2xl p-[10mm]" style={{ width: "210mm", minHeight: "297mm" }}>
            <div className="grid grid-cols-2 gap-8">
              {[leftColumn, rightColumn].map((colStudents, colIdx) => (
                <div key={colIdx}>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-black p-1 w-8">R#</th>
                        <th className="border border-black p-1 text-left">Name</th>
                        <th className="border border-black p-1 w-12">Max</th>
                        <th className="border border-black p-1 w-16">Obt.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colStudents.map((s) => (
                        <tr key={s._id} className="h-8 group">
                          <td className="border border-black text-center font-bold">{s.rollNumber}</td>
                          <td className="border border-black px-2 uppercase truncate">{s.name}</td>
                          <td className="border border-black">
                            <input 
                              type="number"
                              className="w-full h-full text-center bg-transparent focus:bg-yellow-50 outline-none"
                              placeholder="100"
                              onChange={(e) => handleMarkChange(s._id, "total", e.target.value)}
                            />
                          </td>
                          <td className="border border-black">
                            <input 
                              type="number"
                              className="w-full h-full text-center font-bold bg-transparent focus:bg-blue-50 outline-none"
                              onChange={(e) => handleMarkChange(s._id, "obtained", e.target.value)}
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
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
          <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-400">Select class to start entering marks</p>
        </div>
      )}
    </div>
  );
}