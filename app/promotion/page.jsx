"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  GraduationCap,
  RefreshCw,
  AlertTriangle,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PromotionMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");

  // Student selection state: { [studentId]: boolean }
  const [selectedStudents, setSelectedStudents] = useState({});

  // 1. Fetch Classes
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  // 2. Fetch Students based on selection
  const query = new URLSearchParams({
    classId: selectedClassId,
    sectionId: selectedSection,
    status: "Active",
    limit: "100", // Adjust based on class size
  });

  const { data: studentRes, isValidating: studentsLoading } = useSWR(
    selectedClassId ? `/api/students?${query.toString()}` : null,
    fetcher,
  );
  const students = studentRes?.students || [];

  // 3. Auto-select all students when list changes
  useEffect(() => {
    if (students.length > 0) {
      const initialState = {};
      students.forEach((s) => (initialState[s._id] = true));
      setSelectedStudents(initialState);
    }
  }, [students]);

  const currentClass = classes.find((c) => c._id === selectedClassId);
  const classIndex = classes.findIndex((c) => c._id === selectedClassId);
  const nextClass = classes[classIndex + 1];
  const isHighest = classIndex === classes.length - 1 && classIndex !== -1;

  const handleBulkAction = async () => {
    const targetIds = Object.keys(selectedStudents).filter(
      (id) => selectedStudents[id],
    );

    if (targetIds.length === 0)
      return alert("Please select at least one student.");

    const confirmMsg = isHighest
      ? `Archive ${targetIds.length} students as Graduated?`
      : `Promote ${targetIds.length} students to ${nextClass?.name}?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: targetIds, // Sending specific IDs now
          nextClassId: nextClass?._id,
          isHighestClass: isHighest,
        }),
      });

      if (response.ok) {
        alert("Action successful");
        setSelectedClassId(""); // Reset
        router.refresh();
      }
    } catch (err) {
      alert("Error processing promotion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
        <div className="flex items-center gap-3 text-indigo-900 font-bold">
          <Users size={20} />
          <h2>Selective Promotion Manager</h2>
        </div>
        <p className="text-xs text-indigo-700 mt-1">
          Select a class to view students. Uncheck students who should not be
          promoted/archived.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
            Select Class
          </label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
            Select Section
          </label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {currentClass?.sections?.map((s) => (
                <SelectItem key={s._id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student List */}
      {selectedClassId && (
        <Card className="border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">
              Eligible Students ({students.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium">Target:</span>
              {isHighest ? (
                <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                  Graduation
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  {nextClass?.name}
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {studentsLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="animate-spin mx-auto text-slate-300" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-[10px] uppercase text-slate-400 border-b">
                    <th className="p-4 w-12">
                      <Checkbox
                        checked={Object.values(selectedStudents).every(Boolean)}
                        onCheckedChange={(val) => {
                          const next = {};
                          students.forEach((s) => (next[s._id] = val));
                          setSelectedStudents(next);
                        }}
                      />
                    </th>
                    <th className="p-4 font-bold">Student Details</th>
                    <th className="p-4 font-bold">Roll No</th>
                    <th className="p-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={!!selectedStudents[student._id]}
                          onCheckedChange={(val) =>
                            setSelectedStudents((prev) => ({
                              ...prev,
                              [student._id]: val,
                            }))
                          }
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-sm">
                        {student.rollNumber}
                      </td>
                      <td className="p-4">
                        {selectedStudents[student._id] ? (
                          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 uppercase">
                            <CheckCircle2 size={14} />{" "}
                            {isHighest ? "Graduate" : "Promote"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold uppercase">
                            Keep in {currentClass.name}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>

          <div className="p-4 bg-slate-50 border-t flex justify-end">
            <Button
              disabled={loading || students.length === 0}
              onClick={handleBulkAction}
              className={isHighest ? "bg-rose-600" : "bg-indigo-600"}
            >
              {loading && <RefreshCw size={16} className="animate-spin mr-2" />}
              Proceed with{" "}
              {Object.values(selectedStudents).filter(Boolean).length} Students
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${className}`}
    >
      {children}
    </span>
  );
}
