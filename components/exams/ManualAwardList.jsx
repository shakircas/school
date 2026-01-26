"use client";

import { useState, useMemo } from "react";
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
import { Printer, BookOpen, ClipboardList } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ManualAwardList() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const [subject, setSubject] = useState("");

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const studentsUrl = classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null;
  const { data: studentsRes, isLoading } = useSWR(studentsUrl, fetcher);

  const students = studentsRes?.students || [];
  const classes = classesRes?.data || [];

  // Split students into two columns (max 22 per column for A4 height)
  const leftColumn = students.slice(0, 22);
  const rightColumn = students.slice(22, 44);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader title="Award List Generator" description="Create blank marking sheets for teachers">
        <Button onClick={handlePrint} disabled={!classId || students.length === 0} className="bg-zinc-900">
          <Printer className="h-4 w-4 mr-2" /> Print Award List
        </Button>
      </PageHeader>

      {/* Configuration Controls */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="grid md:grid-cols-3 gap-4 pt-6">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
            </SelectContent>
          </Select>

          <input 
            type="text" 
            placeholder="Subject Name (e.g. Mathematics)" 
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            onChange={(e) => setSubject(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* A4 Award List Sheet */}
      {classId && students.length > 0 ? (
        <div className="flex justify-center pb-10">
          <div className="award-list-print bg-white shadow-2xl relative" style={{ width: "210mm", minHeight: "297mm", padding: "10mm" }}>
            
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-black uppercase tracking-tight">Manual Award List</h1>
              <div className="flex justify-between mt-4 text-sm font-bold uppercase">
                <span>Class: {classes.find((c) => c._id === classId)?.name}</span>
                <span>Section: {sectionId}</span>
                <span>Subject: {subject || "________________"}</span>
                <span>Date: ____/____/2026</span>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-8">
              {[leftColumn, rightColumn].map((colStudents, colIdx) => (
                <div key={colIdx}>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-1 w-8 text-center">R.#</th>
                        <th className="border border-black p-1 text-left">Student Name</th>
                        <th className="border border-black p-1 w-12 text-center">Total</th>
                        <th className="border border-black p-1 w-16 text-center">Obtained</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colStudents.map((s, i) => (
                        <tr key={s._id} className="h-8">
                          <td className="border border-black text-center font-medium">{s.rollNumber}</td>
                          <td className="border border-black px-2 uppercase truncate max-w-[120px]">{s.name}</td>
                          <td className="border border-black text-center text-slate-400">____</td>
                          <td className="border border-black text-center"></td>
                        </tr>
                      ))}
                      {/* Fill empty rows if column is short to maintain symmetry */}
                      {colStudents.length < 22 && Array.from({length: 22 - colStudents.length}).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-8">
                          <td className="border border-black"></td>
                          <td className="border border-black"></td>
                          <td className="border border-black"></td>
                          <td className="border border-black"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Footer Signatures */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between pt-8 border-t border-dotted border-black">
              <div className="text-center w-40">
                <div className="border-t border-black pt-1 font-bold text-[10px] uppercase">Subject Teacher</div>
              </div>
              <div className="text-center w-40">
                <div className="border-t border-black pt-1 font-bold text-[10px] uppercase">Exam Coordinator</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
          <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-400">Select class to generate list</p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .award-list-print, .award-list-print * { visibility: visible; }
          .award-list-print {
            position: fixed;
            left: 0; top: 0;
            width: 210mm; height: 297mm;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}