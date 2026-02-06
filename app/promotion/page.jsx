"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PromotionMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("promote"); // 'promote' or 'restore'

  // Filters
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState({});

  // 1. Fetch & Sort Classes
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const rawClasses = classesRes?.data || [];
  const sortedClasses = useMemo(() => {
    const rawClasses = classesRes?.data || [];
    // Sorts Class 1, Class 2... Class 10 correctly using regex to find the number
    return [...rawClasses].sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [classesRes?.data]);

  // 2. Fetch Students (Adjust status based on viewMode)
  const query = new URLSearchParams({
    classId: selectedClassId,
    sectionId: selectedSection,
    status: viewMode === "promote" ? "Active" : "Graduated",
    limit: "200",
  });

  const { data: studentRes, isValidating: studentsLoading } = useSWR(
    selectedClassId ? `/api/students?${query.toString()}` : null,
    fetcher,
  );

  const students = studentRes?.students || [];

  // Filter students by search term locally for speed
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber?.toString().includes(searchTerm),
    );
  }, [students, searchTerm]);

  // Handle auto-selection
//   useEffect(() => {
//     if (filteredStudents.length > 0) {
//       const nextState = {};
//       filteredStudents.forEach((s) => (nextState[s._id] = true));

//       // Only update if the number of students changed to avoid infinite loops
//       setSelectedStudents(nextState);
//     } else {
//       setSelectedStudents({});
//     }
//     // We remove selectedStudents from dependencies to stop the loop
//   }, [students, searchTerm]);

  const currentClass = sortedClasses.find((c) => c._id === selectedClassId);
  const classIndex = sortedClasses.findIndex((c) => c._id === selectedClassId);
  const nextClass = sortedClasses[classIndex + 1];
  const isHighest =
    classIndex === sortedClasses.length - 1 && classIndex !== -1;

  // Toggle single student helper
  const toggleStudent = (id) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // const handleAction = async () => {
  //   const targetIds = Object.keys(selectedStudents).filter(
  //     (id) => selectedStudents[id],
  //   );
  //   if (targetIds.length === 0) return alert("Select students first.");

  //   const confirmMsg =
  //     viewMode === "restore"
  //       ? `Restore ${targetIds.length} students to Active status?`
  //       : isHighest
  //         ? `Archive ${targetIds.length} students as Graduated?`
  //         : `Promote ${targetIds.length} students to ${nextClass?.name}?`;

  //   if (!confirm(confirmMsg)) return;

  //   setLoading(true);
  //   try {
  //     const endpoint =
  //       viewMode === "restore"
  //         ? "/api/promotion/restore"
  //         : "/api/admin/promotion";
  //     const response = await fetch(endpoint, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         studentIds: targetIds,
  //         nextClassId: nextClass?._id,
  //         isHighestClass: isHighest,
  //       }),
  //     });

  //     if (response.ok) {
  //       alert("Operation successful");
  //       router.refresh();
  //     }
  //   } catch (err) {
  //     alert("Error processing request");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAction = async () => {
    const targetIds = Object.keys(selectedStudents).filter(
      (id) => selectedStudents[id],
    );

    if (targetIds.length === 0) {
      return alert("Select students first.");
    }

    const confirmMsg =
      viewMode === "restore"
        ? `Restore ${targetIds.length} students to Active status?`
        : isHighest
          ? `Graduate ${targetIds.length} students (Class completed)?`
          : `Promote ${targetIds.length} students to ${nextClass?.name}?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);

    try {
      const endpoint =
        viewMode === "restore"
          ? "/api/archive/students/restore"
          : "/api/admin/promotion";

      const payload =
        viewMode === "restore"
          ? {
              studentIds: targetIds,
            }
          : {
              studentIds: targetIds,
              nextClassId: nextClass?._id || null,
              isHighestClass: isHighest,
              currentClassId: selectedClassId, // ✅ REQUIRED
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Operation failed");
        return;
      }

      alert(data.message || "Operation successful");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error processing request");
    } finally {
      setLoading(false);
    }
  };


  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* View Switcher */}
        <div className="flex justify-end gap-2">
          <Button
            variant={viewMode === "promote" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setViewMode("promote");
              setSelectedClassId("");
            }}
          >
            Promotion Mode
          </Button>
          <Button
            variant={viewMode === "restore" ? "destructive" : "outline"}
            size="sm"
            onClick={() => {
              setViewMode("restore");
              setSelectedClassId("");
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Restore Graduated
          </Button>
        </div>

        <div
          className={`${viewMode === "restore" ? "bg-rose-50 border-rose-500" : "bg-indigo-50 border-indigo-500"} border-l-4 p-4 rounded-r-lg`}
        >
          <div className="flex items-center gap-3 text-slate-900 font-bold">
            {viewMode === "promote" ? (
              <Users size={20} />
            ) : (
              <RotateCcw size={20} />
            )}
            <h2>
              {viewMode === "promote"
                ? "Selective Promotion Manager"
                : "Restore Archive Students"}
            </h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Class
            </label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Class" />
              </SelectTrigger>
              <SelectContent>
                {sortedClasses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Section
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

        {selectedClassId && (
          <Card className="border-slate-200 overflow-hidden shadow-md">
            <div className="bg-slate-50 border-b p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Students List</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Target:
                  </span>
                  {viewMode === "restore" ? (
                    <Badge className="bg-blue-100 text-blue-700">
                      Re-activate in {currentClass.name}
                    </Badge>
                  ) : isHighest ? (
                    <Badge className="bg-rose-100 text-rose-700 font-black">
                      GRADUATION
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 font-black">
                      {nextClass?.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or roll number..."
                  className="pl-10 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {studentsLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="animate-spin mx-auto text-indigo-500" />
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr className="text-[10px] uppercase text-slate-400">
                      <th className="p-4 w-12 text-center">
                        <Checkbox
                          checked={
                            Object.values(selectedStudents).length > 0 &&
                            Object.values(selectedStudents).every(Boolean)
                          }
                          onCheckedChange={(val) => {
                            const next = {};
                            filteredStudents.forEach(
                              (s) => (next[s._id] = !!val),
                            );
                            setSelectedStudents(next);
                          }}
                        />
                      </th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Roll</th>
                      <th className="p-4">Status Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={!!selectedStudents[student._id]}
                            onCheckedChange={(val) =>
                              setSelectedStudents((prev) => ({
                                ...prev,
                                [student._id]: !!val,
                              }))
                            }
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase">
                            {student.sectionId}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {student.rollNumber}
                        </td>
                        <td className="p-4">
                          {selectedStudents[student._id] ? (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase">
                              <ArrowRight size={12} />{" "}
                              {viewMode === "restore"
                                ? "Activate"
                                : isHighest
                                  ? "Graduate"
                                  : "Promote"}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-bold uppercase">
                              No Change
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
                disabled={loading || filteredStudents.length === 0}
                onClick={handleAction}
                variant={viewMode === "restore" ? "destructive" : "default"}
                className={
                  viewMode === "promote" && !isHighest ? "bg-indigo-600" : ""
                }
              >
                {loading && <RefreshCw className="animate-spin mr-2 w-4 h-4" />}
                {viewMode === "restore"
                  ? "Restore Selected"
                  : isHighest
                    ? "Archive Selected"
                    : "Promote Selected"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${className}`}
    >
      {children}
    </span>
  );
}
