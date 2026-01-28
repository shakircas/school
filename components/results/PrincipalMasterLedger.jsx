// "use client";

// import React, { useState, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Search,
//   Download,
//   Filter,
//   FileSpreadsheet,
//   Printer,
// } from "lucide-react";

// export function PrincipalMasterLedger({ results, classes, exams }) {
//   const [selectedClass, setSelectedClass] = useState("all");
//   const [selectedExam, setSelectedExam] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");

//   // 1. Filter results based on Principal's selection
//   const filteredResults = useMemo(() => {
//     return results.filter((res) => {
//       const matchClass =
//         selectedClass === "all" || res.classId?._id === selectedClass;
//       const matchExam =
//         selectedExam === "all" || res.exam?._id === selectedExam;
//       const matchSearch =
//         res.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         res.student?.rollNumber?.includes(searchQuery);
//       return matchClass && matchExam && matchSearch;
//     });
//   }, [results, selectedClass, selectedExam, searchQuery]);

//   // 2. Extract unique subject names for table headers
//   const allSubjectNames = useMemo(() => {
//     const subjects = new Set();
//     filteredResults.forEach((res) => {
//       res.subjects?.forEach((s) => subjects.add(s.subject));
//     });
//     return Array.from(subjects);
//   }, [filteredResults]);

//   const handleExportCSV = () => {
//     // Basic CSV Logic
//     const headers = [
//       "Roll No",
//       "Student Name",
//       ...allSubjectNames,
//       "Total",
//       "Percentage",
//       "Status",
//     ];
//     const rows = filteredResults.map((res) => {
//       const subjectMarks = allSubjectNames.map((subjName) => {
//         const found = res.subjects.find((s) => s.subject === subjName);
//         return found ? found.obtainedMarks : "-";
//       });
//       return [
//         res.student?.rollNumber,
//         res.student?.name,
//         ...subjectMarks,
//         res.totalObtained,
//         res.percentage + "%",
//         res.status,
//       ];
//     });

//     const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `Result_Ledger_${new Date().toLocaleDateString()}.csv`;
//     link.click();
//   };

//   return (
//     <Card className="w-full shadow-xl border-t-4 border-t-primary overflow-hidden">
//       <CardHeader className="bg-slate-50 border-b print:hidden">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-primary p-2 rounded-lg">
//               <FileSpreadsheet className="text-white h-6 w-6" />
//             </div>
//             <div>
//               <CardTitle className="text-xl font-bold">
//                 Master Result Ledger
//               </CardTitle>
//               <p className="text-sm text-muted-foreground font-medium text-blue-600">
//                 Excel-Style Administrative View
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap items-center gap-2">
//             <Button variant="outline" size="sm" onClick={() => window.print()}>
//               <Printer className="h-4 w-4 mr-2" /> Print
//             </Button>
//             <Button
//               variant="default"
//               size="sm"
//               onClick={handleExportCSV}
//               className="bg-emerald-600 hover:bg-emerald-700"
//             >
//               <Download className="h-4 w-4 mr-2" /> Export CSV
//             </Button>
//           </div>
//         </div>

//         {/* Filters Row */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//           <div className="space-y-1.5">
//             <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">
//               Select Class
//             </label>
//             <Select value={selectedClass} onValueChange={setSelectedClass}>
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="All Classes" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Classes</SelectItem>
//                 {classes?.map((c) => (
//                   <SelectItem key={c._id} value={c._id}>
//                     {c.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">
//               Select Exam
//             </label>
//             <Select value={selectedExam} onValueChange={setSelectedExam}>
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="All Exams" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Exams</SelectItem>
//                 {exams?.map((e) => (
//                   <SelectItem key={e._id} value={e._id}>
//                     {e.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="md:col-span-2 space-y-1.5">
//             <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">
//               Search Student
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <Input
//                 placeholder="Search by name or roll number..."
//                 className="pl-9 bg-white"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
//           <Table>
//             <TableHeader className="sticky top-0 z-20 bg-slate-100 shadow-sm">
//               <TableRow className="hover:bg-transparent">
//                 <TableHead className="w-[80px] font-bold text-slate-800 border-r bg-slate-100 sticky left-0 z-30">
//                   Roll No
//                 </TableHead>
//                 <TableHead className="w-[200px] font-bold text-slate-800 border-r bg-slate-100 sticky left-[80px] z-30">
//                   Student Name
//                 </TableHead>

//                 {allSubjectNames.map((subj) => (
//                   <TableHead
//                     key={subj}
//                     className="text-center font-bold text-slate-800 border-r min-w-[100px]"
//                   >
//                     {subj}
//                   </TableHead>
//                 ))}

//                 <TableHead className="text-center font-bold text-indigo-700 bg-indigo-50 border-r min-w-[80px]">
//                   Total
//                 </TableHead>
//                 <TableHead className="text-center font-bold text-indigo-700 bg-indigo-50 min-w-[80px]">
//                   Result
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredResults.length > 0 ? (
//                 filteredResults.map((res) => (
//                   <TableRow
//                     key={res._id}
//                     className="hover:bg-slate-50 transition-colors"
//                   >
//                     <TableCell className="font-mono text-xs border-r bg-white sticky left-0 z-10">
//                       {res.student?.rollNumber}
//                     </TableCell>
//                     <TableCell className="font-bold text-slate-700 border-r bg-white sticky left-[80px] z-10">
//                       {res.student?.name}
//                     </TableCell>

//                     {allSubjectNames.map((subjName) => {
//                       const subject = res.subjects?.find(
//                         (s) => s.subject === subjName,
//                       );
//                       const marks = subject?.obtainedMarks;
//                       const isFail = marks < (subject?.passingMarks || 33);

//                       return (
//                         <TableCell
//                           key={subjName}
//                           className={`text-center border-r font-medium ${isFail ? "text-red-600 bg-red-50/30" : "text-slate-600"}`}
//                         >
//                           {marks ?? "-"}
//                         </TableCell>
//                       );
//                     })}

//                     <TableCell className="text-center font-black text-slate-800 bg-indigo-50/30 border-r">
//                       {res.totalObtained}
//                     </TableCell>
//                     <TableCell className="text-center bg-indigo-50/30">
//                       <Badge
//                         variant={
//                           res.status === "Pass" ? "success" : "destructive"
//                         }
//                         className="text-[10px] px-2 py-0"
//                       >
//                         {res.status}
//                       </Badge>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={allSubjectNames.length + 4}
//                     className="h-40 text-center text-muted-foreground italic"
//                   >
//                     No results found for the selected criteria.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>

//       <div className="p-4 bg-slate-50 border-t flex justify-between items-center print:hidden">
//         <p className="text-xs font-medium text-slate-500 italic">
//           * Red highlighted marks indicate failure in that subject.
//         </p>
//         <p className="text-xs font-bold text-slate-700">
//           Showing {filteredResults.length} records
//         </p>
//       </div>
//     </Card>
//   );
// }

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Trophy,
  User,
  ExternalLink,
} from "lucide-react";

export function PrincipalMasterLedger({
  results = [],
  classes = [],
  exams = [],
}) {
  // 1. PERSISTENT STATES
  const [selectedClass, setSelectedClass] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("p_ledger_class") || "all"
      : "all",
  );
  const [selectedExam, setSelectedExam] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("p_ledger_exam") || "all"
      : "all",
  );
  const [sortBy, setSortBy] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("p_ledger_sort") || "rank"
      : "rank",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);

  useEffect(() => {
    localStorage.setItem("p_ledger_class", selectedClass);
    localStorage.setItem("p_ledger_exam", selectedExam);
    localStorage.setItem("p_ledger_sort", sortBy);
  }, [selectedClass, selectedExam, sortBy]);

  // 2. FILTERING & CALCULATION LOGIC
  const processedResults = useMemo(() => {
    let items = results.filter((res) => {
      const matchClass =
        selectedClass === "all" ||
        res.classId?._id === selectedClass ||
        res.classId === selectedClass;
      const matchExam =
        selectedExam === "all" ||
        res.exam?._id === selectedExam ||
        res.exam === selectedExam;
      const matchSearch =
        res.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.student?.rollNumber?.includes(searchQuery);
      return matchClass && matchExam && matchSearch;
    });

    // Map calculated fields
    let mapped = items.map((r) => {
      const totalMax =
        r.subjects?.reduce((acc, s) => acc + (s.totalMarks || 0), 0) || 0;
      const totalObtained =
        r.subjects?.reduce((acc, s) => acc + (s.obtainedMarks || 0), 0) || 0;
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      return {
        ...r,
        calculatedPerc: percentage,
        calculatedObtained: totalObtained,
        totalMax,
      };
    });

    // Handle Sorting
    return mapped.sort((a, b) => {
      if (sortBy === "rank") return b.calculatedPerc - a.calculatedPerc;
      if (sortBy === "rollNumber")
        return (a.student?.rollNumber || "").localeCompare(
          b.student?.rollNumber || "",
        );
      if (sortBy === "name")
        return (a.student?.name || "").localeCompare(b.student?.name || "");
      return 0;
    });
  }, [results, selectedClass, selectedExam, searchQuery, sortBy]);

  const allSubjectNames = useMemo(() => {
    const subjects = new Set();
    processedResults.forEach((res) =>
      res.subjects?.forEach((s) => subjects.add(s.subject)),
    );
    return Array.from(subjects);
  }, [processedResults]);

  const getCellHighlight = (marks, total) => {
    if (!marks && marks !== 0) return "";
    const perc = (marks / total) * 100;
    if (perc >= 90) return "bg-emerald-50 text-emerald-700 font-bold";
    if (perc < 33) return "bg-red-50 text-red-700 font-bold";
    return "";
  };

  const handlePrint = () => window.print();

  return (
    <>
      <Card className="w-full shadow-xl border-t-4 border-t-slate-900 overflow-hidden bg-white print:border-0 print:shadow-none">
        <CardHeader className="bg-slate-50 border-b print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <FileSpreadsheet className="text-white h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Principal's Master Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-500" /> Academic
                  Performance Records
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedClass("all");
                  setSelectedExam("all");
                  setSortBy("rank");
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Entire School</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams?.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white font-medium border-indigo-200">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Sort: Rank (High to Low)</SelectItem>
                <SelectItem value="rollNumber">Sort: Roll Number</SelectItem>
                <SelectItem value="name">Sort: Student Name</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-1 lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name or roll..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[70vh] relative">
            <Table>
              <TableHeader className="sticky top-0 z-30 bg-slate-100 shadow-sm">
                <TableRow>
                  <TableHead className="w-[80px] font-bold text-slate-800 border-r bg-slate-100 sticky left-0 z-40">
                    Roll
                  </TableHead>
                  <TableHead className="w-[200px] font-bold text-slate-800 border-r bg-slate-100 sticky left-[80px] z-40">
                    Student Name
                  </TableHead>
                  {allSubjectNames.map((subj) => (
                    <TableHead
                      key={subj}
                      className="text-center font-bold text-slate-700 border-r min-w-[100px] text-[11px] uppercase"
                    >
                      {subj}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold text-slate-900 bg-slate-200 border-r">
                    Total
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900 bg-slate-200">
                    Score %
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {processedResults.map((res) => (
                  <TableRow key={res._id} className="hover:bg-slate-50 group">
                    <TableCell className="font-mono text-xs border-r bg-white group-hover:bg-slate-50 sticky left-0 z-20">
                      {res.student?.rollNumber}
                    </TableCell>
                    <TableCell
                      className="font-bold text-indigo-600 cursor-pointer hover:underline border-r bg-white group-hover:bg-slate-50 sticky left-[80px] z-20"
                      onClick={() => setSelectedStudentResult(res)}
                    >
                      <div className="flex items-center gap-2">
                        {res.student?.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>

                    {allSubjectNames.map((subjName) => {
                      const subject = res.subjects?.find(
                        (s) => s.subject === subjName,
                      );
                      return (
                        <TableCell
                          key={subjName}
                          className={`text-center border-r text-sm ${getCellHighlight(subject?.obtainedMarks, subject?.totalMarks || 100)}`}
                        >
                          {subject?.obtainedMarks ?? "-"}
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-center font-bold text-slate-900 bg-slate-50/50 border-r">
                      {res.calculatedObtained}
                    </TableCell>
                    <TableCell className="text-center bg-slate-50/50">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-xs text-slate-800">
                          {res.calculatedPerc.toFixed(1)}%
                        </span>
                        <div className="w-10 h-1 bg-slate-200 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${res.calculatedPerc >= 33 ? "bg-indigo-500" : "bg-red-500"}`}
                            style={{ width: `${res.calculatedPerc}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DETAILED STUDENT SIDE PANEL */}
      <Sheet
        open={!!selectedStudentResult}
        onOpenChange={() => setSelectedStudentResult(null)}
      >
        <SheetContent className="sm:max-w-md p-4 overflow-y-auto">
          <SheetHeader className="pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <SheetTitle className="text-xl">
                  {selectedStudentResult?.student?.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Roll No: {selectedStudentResult?.student?.rollNumber}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div id="student-card-content" className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Total Marks
                </p>
                <p className="text-2xl font-black">
                  {selectedStudentResult?.calculatedObtained} /{" "}
                  {selectedStudentResult?.totalMax}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Percentage
                </p>
                <p className="text-2xl font-black text-indigo-600">
                  {selectedStudentResult?.calculatedPerc.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FileSpreadsheet size={16} /> Subject Breakdown
              </h4>
              {selectedStudentResult?.subjects?.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium">{s.subject}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      {s.obtainedMarks} / {s.totalMarks}
                    </span>
                    <Badge
                      variant={
                        s.obtainedMarks / s.totalMarks >= 0.33
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {Math.round((s.obtainedMarks / s.totalMarks) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Print-specific Styles */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #student-card-content,
              #student-card-content * {
                visibility: visible;
              }
              #student-card-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}</style>
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Result PDF
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
