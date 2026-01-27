// "use client";

// import { useMemo, useState } from "react";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Printer,
//   Save,
//   CheckCircle2,
//   ClipboardList,
//   Loader2,
//   FileUp,
//   FileDown,
//   Trash2,
//   Search,
//   UserX,
// } from "lucide-react";
// import { toast } from "sonner";
// import { PageHeader } from "../ui/page-header";
// import * as XLSX from "xlsx";
// import { Input } from "../ui/input";

// const fetcher = (url) => fetch(url).then((r) => r.json());

// export default function BulkMarksEntry() {
//   const [classId, setClassId] = useState("");
//   const [sectionId, setSectionId] = useState("A");
//   const [subjectId, setSubjectId] = useState("");
//   const [examId, setExamId] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [showSummary, setShowSummary] = useState(false);
//   const [summary, setSummary] = useState({ pass: 0, fail: 0, total: 0 });
//   const [searchTerm, setSearchTerm] = useState(""); // Search state

//   // API Data
//   const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
//   const { data: examsRes } = useSWR("/api/exams", fetcher);
//   const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
//   const { data: studentsRes } = useSWR(
//     classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null,
//     fetcher,
//   );

//   const [marksData, setMarksData] = useState({});

//   const students = studentsRes?.students || [];
//   const subjects = subjectsRes?.data || [];
//   const exams = examsRes?.data || [];
//   const classes = classesRes?.data || [];

//   const filteredStudents = useMemo(() => {
//     return students.filter(
//       (s) =>
//         s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         s.rollNumber.toString().includes(searchTerm),
//     );
//   }, [students, searchTerm]);

//   const leftColumn = students.slice(0, 22);
//   const rightColumn = students.slice(22, 44);

//   const handleMarkChange = (studentId, field, value) => {
//     setMarksData((prev) => ({
//       ...prev,
//       [studentId]: {
//         ...prev[studentId],
//         [field]: value,
//         isAbsent:
//           field === "obtained" && value.toLowerCase() === "abs"
//             ? true
//             : prev[studentId]?.isAbsent,
//       },
//     }));
//   };

//   const handleClear = () => {
//     if (Object.keys(marksData).length === 0) return;
//     const confirmClear = window.confirm("Clear all unsaved changes?");
//     if (confirmClear) {
//       setMarksData({});
//       toast.info("Grid cleared");
//     }
//   };

//   // --- AUTO-FILL ABSENT LOGIC ---
//   const handleAutoFillAbsent = () => {
//     const newMarks = { ...marksData };
//     let count = 0;
//     students.forEach((s) => {
//       if (!newMarks[s._id] || !newMarks[s._id].obtained) {
//         newMarks[s._id] = {
//           ...newMarks[s._id],
//           total: newMarks[s._id]?.total || 100,
//           obtained: 0,
//           isAbsent: true,
//         };
//         count++;
//       }
//     });
//     setMarksData(newMarks);
//     toast.info(`Marked ${count} students as Absent`);
//   };

//   const downloadTemplate = () => {
//     if (students.length === 0 || !subjectId) {
//       return toast.error("Please select a Class and Subject first");
//     }
//     const selectedSub = subjects.find((s) => s._id === subjectId);
//     const templateData = students.map((s) => ({
//       "Roll Number": s.rollNumber,
//       "Student Name": s.name,
//       "Student ID (Do Not Edit)": s._id,
//       Subject: selectedSub?.name,
//       "Total Marks": 100,
//       "Obtained Marks": "",
//       "Is Absent": "No",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(templateData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Entry");
//     worksheet["!cols"] = [
//       { wch: 10 },
//       { wch: 25 },
//       { wch: 25 },
//       { wch: 20 },
//       { wch: 12 },
//       { wch: 15 },
//       { wch: 10 },
//     ];
//     XLSX.writeFile(workbook, `${selectedSub?.name}_Template.xlsx`);
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const data = new Uint8Array(event.target?.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
//         const newMarksData = {};

//         jsonData.forEach((row) => {
//           const studentId = row["Student ID (Do Not Edit)"];
//           if (studentId) {
//             const absentText = row["Is Absent"]?.toString().toLowerCase();
//             const isAbsent = absentText === "yes" || absentText === "true";
//             newMarksData[studentId] = {
//               total: Number(row["Total Marks"]) || 100,
//               obtained: isAbsent ? 0 : Number(row["Obtained Marks"]) || 0,
//               isAbsent: isAbsent,
//             };
//           }
//         });
//         setMarksData(newMarksData);
//         toast.success(
//           `Imported marks for ${Object.keys(newMarksData).length} students`,
//         );
//       } catch (error) {
//         toast.error("Excel Parse Error");
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleBulkSave = async () => {
//     if (!subjectId || !examId || !classId)
//       return toast.error("Please select all filters");
//     if (Object.keys(marksData).length === 0)
//       return toast.error("No marks entered to save");

//     setIsSaving(true);
//     try {
//       const selectedSubject = subjects.find((s) => s._id === subjectId);
//       const payload = {
//         examId,
//         classId,
//         sectionId,
//         subjectName: selectedSubject?.name,
//         results: Object.entries(marksData).map(([id, val]) => ({
//           studentId: id,
//           obtainedMarks: Number(val.obtained || 0),
//           totalMarks: Number(val.total || 100),
//           isAbsent: val.isAbsent || false,
//         })),
//       };

//       const res = await fetch("/api/results/bulk", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (res.ok) {
//         const total = payload.results.length;
//         const pass = payload.results.filter(
//           (r) => r.obtainedMarks >= r.totalMarks * 0.33,
//         ).length;
//         setSummary({ total, pass, fail: total - pass });
//         setShowSummary(true);
//         toast.success("Marks synchronized successfully");
//       } else {
//         const errData = await res.json();
//         throw new Error(errData.error || "Failed to save");
//       }
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="print:hidden">
//         <PageHeader
//           title="Bulk Marks Entry"
//           description="2026 Academic Session - Award List Management"
//         >
//           <div className="print:hidden flex flex-wrap gap-2">
//             <Button
//               variant="ghost"
//               onClick={handleClear}
//               disabled={Object.keys(marksData).length === 0}
//               className="text-red-500 hover:bg-red-50"
//             >
//               <Trash2 className="h-4 w-4 mr-2" /> Clear
//             </Button>
//             <Button
//               variant="outline"
//               onClick={handleAutoFillAbsent}
//               disabled={!classId || students.length === 0}
//               className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
//             >
//               <UserX className="h-4 w-4 mr-2" /> Mark Missing as ABS
//             </Button>
//             <Button
//               variant="outline"
//               onClick={downloadTemplate}
//               disabled={!classId || !subjectId}
//             >
//               <FileDown className="h-4 w-4 mr-2" /> Template
//             </Button>
//             <div className="relative">
//               <input
//                 type="file"
//                 accept=".xlsx, .xls"
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//                 onChange={handleFileUpload}
//                 disabled={!classId}
//               />
//               <Button variant="secondary" disabled={!classId}>
//                 <FileUp className="h-4 w-4 mr-2" /> Import
//               </Button>
//             </div>
//             <Button
//               variant="outline"
//               onClick={() => window.print()}
//               className="print:hidden"
//             >
//               <Printer className="h-4 w-4 mr-2" /> Print
//             </Button>
//             <Button
//               onClick={handleBulkSave}
//               disabled={isSaving || !classId}
//               className="bg-emerald-600 hover:bg-emerald-700"
//             >
//               {isSaving ? (
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//               ) : (
//                 <Save className="h-4 w-4 mr-2" />
//               )}{" "}
//               Save Marks
//             </Button>
//           </div>
//         </PageHeader>
//       </div>

//       <Card className="print:hidden border-none shadow-sm bg-slate-50">
//         <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
//           <Select value={examId} onValueChange={setExamId}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Exam" />
//             </SelectTrigger>
//             <SelectContent>
//               {exams.map((e) => (
//                 <SelectItem key={e._id} value={e._id}>
//                   {e.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Select value={classId} onValueChange={setClassId}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Class" />
//             </SelectTrigger>
//             <SelectContent>
//               {classes.map((c) => (
//                 <SelectItem key={c._id} value={c._id}>
//                   {c.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Select value={subjectId} onValueChange={setSubjectId}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Subject" />
//             </SelectTrigger>
//             <SelectContent>
//               {subjects.map((s) => (
//                 <SelectItem key={s._id} value={s._id}>
//                   {s.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {/* <Select value={sectionId} onValueChange={setSectionId}>
//             <SelectTrigger>
//               <SelectValue placeholder="Section" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="A">Section A</SelectItem>
//               <SelectItem value="B">Section B</SelectItem>
//             </SelectContent>
//           </Select> */}
//           <div className="relative ">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
//             <Input
//               placeholder="Search by name or roll number..."
//               className="pl-9 bg-white"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* SEARCH BAR INTEGRATION */}
//       {/* <Card>
//         <CardContent></CardContent>
//       </Card> */}

//       {classId && filteredStudents.length > 0 ? (
//         <div className="flex justify-center pb-10">
//           <div
//             className="award-list-print bg-white shadow-2xl p-[10mm]"
//             style={{ width: "210mm", minHeight: "297mm" }}
//           >
//             <div className="text-center mb-6 border-b-2 border-black pb-2">
//               <h1 className="text-2xl font-bold uppercase">
//                 Award List - 2026
//               </h1>
//               <p className="text-sm">
//                 Exam: {exams.find((e) => e._id === examId)?.name} | Subject:{" "}
//                 {subjects.find((s) => s._id === subjectId)?.name.toUpperCase()}
//               </p>
//             </div>
//             <div className="grid grid-cols-2 gap-8">
//               {[leftColumn, rightColumn].map((colStudents, colIdx) => (
//                 <div key={colIdx}>
//                   <table className="w-full border-collapse border border-black text-[11px]">
//                     <thead className="bg-slate-100 uppercase">
//                       <tr>
//                         <th className="border border-black p-1 w-8">R#</th>
//                         <th className="border border-black p-1 text-left">
//                           Student Name
//                         </th>
//                         <th className="border border-black p-1 w-12">Max</th>
//                         <th className="border border-black p-1 w-16">Obt.</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {colStudents.map((s) => (
//                         <tr
//                           key={s._id}
//                           className={`h-8 group ${marksData[s._id] ? "bg-blue-50/50" : ""}`}
//                         >
//                           <td className="border border-black text-center font-bold">
//                             {s.rollNumber}
//                           </td>
//                           <td className="border border-black px-2 uppercase truncate">
//                             {s.name}
//                           </td>
//                           <td className="border border-black">
//                             <input
//                               type="number"
//                               className="w-full h-full text-center bg-transparent outline-none"
//                               value={marksData[s._id]?.total || ""}
//                               placeholder="100"
//                               onChange={(e) =>
//                                 handleMarkChange(s._id, "total", e.target.value)
//                               }
//                             />
//                           </td>
//                           <td className="border border-black">
//                             <input
//                               type="text"
//                               className={`w-full h-full text-center font-bold bg-transparent outline-none ${marksData[s._id]?.isAbsent ? "text-red-600" : ""}`}
//                               value={
//                                 marksData[s._id]?.isAbsent
//                                   ? "ABS"
//                                   : marksData[s._id]?.obtained || ""
//                               }
//                               onChange={(e) =>
//                                 handleMarkChange(
//                                   s._id,
//                                   "obtained",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-12 flex justify-between px-4 text-xs font-bold uppercase italic">
//               <span>Teacher's Signature: _________________</span>
//               <span>Principal's Seal: _________________</span>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
//           <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
//           <p className="text-slate-400 font-medium">
//             Select criteria to load the Award List
//           </p>
//         </div>
//       )}

//       <Dialog open={showSummary} onOpenChange={setShowSummary}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <CheckCircle2 className="text-emerald-500" /> Save Complete
//             </DialogTitle>
//             <DialogDescription>
//               Performance summary for{" "}
//               {subjects.find((s) => s._id === subjectId)?.name}:
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-3 gap-4 py-4 text-center">
//             <div className="bg-slate-50 p-3 rounded-lg">
//               <p className="text-xs text-slate-500 uppercase">Total</p>
//               <p className="text-xl font-bold">{summary.total}</p>
//             </div>
//             <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
//               <p className="text-xs text-emerald-600 uppercase">Pass</p>
//               <p className="text-xl font-bold text-emerald-700">
//                 {summary.pass}
//               </p>
//             </div>
//             <div className="bg-red-50 p-3 rounded-lg border border-red-100">
//               <p className="text-xs text-red-600 uppercase">Fail</p>
//               <p className="text-xl font-bold text-red-700">{summary.fail}</p>
//             </div>
//           </div>
//           <DialogFooter className="flex-col gap-2">
//             <Button
//               onClick={() => window.print()}
//               variant="outline"
//               className="w-full"
//             >
//               <Printer className="mr-2 h-4 w-4" /> Print Final Award List
//             </Button>
//             <Button onClick={() => setShowSummary(false)} className="w-full">
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useMemo, useState } from "react";
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
  Search,
  UserX,
  Filter,
  BarChart3,
  ListOrdered,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../ui/page-header";
import * as XLSX from "xlsx";
import { Input } from "../ui/input";

const fetcher = (url) => fetch(url).then((r) => r.json());

// --- GRADE CALCULATOR LOGIC ---
const calculateGrade = (obtained, total) => {
  if (!obtained && obtained !== 0)
    return { label: "-", color: "text-slate-300" };
  const percentage = (Number(obtained) / Number(total || 100)) * 100;
  if (percentage >= 90) return { label: "A+", color: "text-emerald-600" };
  if (percentage >= 80) return { label: "A", color: "text-emerald-500" };
  if (percentage >= 70) return { label: "B", color: "text-blue-500" };
  if (percentage >= 60) return { label: "C", color: "text-amber-500" };
  if (percentage >= 50) return { label: "D", color: "text-orange-500" };
  if (percentage >= 33) return { label: "E", color: "text-orange-400" };
  return { label: "F", color: "text-red-600" };
};

export default function BulkMarksEntry() {
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'analytics'
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({ pass: 0, fail: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bulkMaxMarks, setBulkMaxMarks] = useState("100");

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

  // --- 1. SEARCH & 3. STATUS FILTER LOGIC ---
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toString().includes(searchTerm);

      const entry = marksData[s._id];
      const isPending = !entry || (entry.obtained === "" && !entry.isAbsent);
      const isAbsent = entry?.isAbsent;

      if (statusFilter === "pending") return matchesSearch && isPending;
      if (statusFilter === "absent") return matchesSearch && isAbsent;
      return matchesSearch;
    });
  }, [students, searchTerm, statusFilter, marksData]);

  // Data split for 2-column print layout
  const half = Math.ceil(filteredStudents.length / 2);
  const leftColumn = filteredStudents.slice(0, half);
  const rightColumn = filteredStudents.slice(half);

  // --- 5. DATA ANALYTICS LOGIC ---
  const gradeStats = useMemo(() => {
    const counts = { "A+": 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    Object.values(marksData).forEach((m) => {
      const grade = m.isAbsent
        ? "F"
        : calculateGrade(m.obtained, m.total).label;
      if (counts[grade] !== undefined) counts[grade]++;
    });
    return counts;
  }, [marksData]);

  const handleMarkChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        isAbsent:
          field === "obtained" && value.toLowerCase() === "abs"
            ? true
            : field === "obtained" && value !== ""
              ? false
              : prev[studentId]?.isAbsent,
      },
    }));
  };

  // --- 6. BULK TOTAL UPDATER ---
  const handleBulkUpdateTotal = () => {
    const newMarks = { ...marksData };
    students.forEach((s) => {
      newMarks[s._id] = { ...newMarks[s._id], total: bulkMaxMarks };
    });
    setMarksData(newMarks);
    toast.success(`Max marks set to ${bulkMaxMarks} for all students`);
  };

  const handleClear = () => {
    if (Object.keys(marksData).length === 0) return;
    if (window.confirm("Clear all unsaved changes?")) {
      setMarksData({});
      toast.info("Grid cleared");
    }
  };

  // --- 2. ATTENDANCE AUTO-FILL LOGIC ---
  const handleAutoFillAbsent = () => {
    const newMarks = { ...marksData };
    let count = 0;
    students.forEach((s) => {
      if (
        !newMarks[s._id] ||
        (newMarks[s._id].obtained === "" && !newMarks[s._id].isAbsent)
      ) {
        newMarks[s._id] = {
          ...newMarks[s._id],
          total: newMarks[s._id]?.total || bulkMaxMarks,
          obtained: 0,
          isAbsent: true,
        };
        count++;
      }
    });
    setMarksData(newMarks);
    toast.info(`Marked ${count} students as Absent`);
  };

  // ... (Original Excel logic kept exactly as provided)
  const downloadTemplate = () => {
    if (students.length === 0 || !subjectId)
      return toast.error("Select Class/Subject first");
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
        toast.success("Marks saved successfully");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-2 space-y-3">
      <div className="print:hidden">
        <PageHeader
          title="Bulk Marks Entry"
          description="Award List"
        >
          <div className="flex flex-wrap gap-1">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
              <Button
                variant={viewMode === "list" ? "white" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <ListOrdered className="h-4 w-4 mr-2" /> List
              </Button>
              <Button
                variant={viewMode === "analytics" ? "white" : "ghost"}
                size="sm"
                onClick={() => setViewMode("analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleAutoFillAbsent}
              className="text-orange-600 bg-orange-50"
            >
              <UserX className="h-4 w-4 mr-2" /> Mark ABS
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" /> Template
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button variant="secondary">
                <FileUp className="h-4 w-4 mr-2" /> Import
              </Button>
            </div>
            <Button
              onClick={handleBulkSave}
              disabled={isSaving || !classId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}{" "}
              Save Records
            </Button>
          </div>
        </PageHeader>
      </div>

      <Card className="print:hidden border-none shadow-sm bg-slate-50">
        <CardContent className="grid md:grid-cols-7 gap-3 pt-6">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Exam" />
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
              <SelectValue placeholder="Class" />
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
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 6. BULK TOTAL UPDATER INPUT */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={bulkMaxMarks}
              onChange={(e) => setBulkMaxMarks(e.target.value)}
              className="w-16 bg-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkUpdateTotal}
              title="Apply Max Marks to All"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>

          {/* 3. STATUS FILTER */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="absent">Absent Only</SelectItem>
            </SelectContent>
          </Select>

          {/* 1. SEARCH BAR */}
          <div className="relative col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search roll or name..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {classId &&
        (viewMode === "analytics" ? (
          <Card className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-emerald-500" /> Grade Distribution
              Analysis
            </h3>
            <div className="flex items-end gap-4 h-64 border-b border-l p-4">
              {Object.entries(gradeStats).map(([grade, count]) => (
                <div
                  key={grade}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <span className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                  <div
                    className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-600"
                    style={{
                      height: `${(count / Math.max(...Object.values(gradeStats), 1)) * 100}%`,
                      minHeight: count > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="text-sm font-black text-slate-700">
                    {grade}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : filteredStudents.length > 0 ? (
          <div className="flex justify-center pb-10">
            <div
              className="award-list-print bg-white shadow-2xl p-[10mm] border"
              style={{ width: "210mm", minHeight: "297mm" }}
            >
              <div className="text-center mb-6 border-b-2 border-black pb-2 uppercase">
                <h1 className="text-2xl font-black">
                  Official Award List - 2026
                </h1>
                <p className="text-xs font-bold mt-1">
                  Class: {classes.find((c) => c._id === classId)?.name} |
                  Subject: {subjects.find((s) => s._id === subjectId)?.name} |
                  Exam: {exams.find((e) => e._id === examId)?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {[leftColumn, rightColumn].map((colStudents, colIdx) => (
                  <div key={colIdx}>
                    <table className="w-full border-collapse border border-black text-[11px]">
                      <thead className="bg-slate-50 uppercase font-bold">
                        <tr>
                          <th className="border border-black p-1 w-8">R#</th>
                          <th className="border border-black p-1 text-left">
                            Student Name
                          </th>
                          <th className="border border-black p-1 w-10">Max</th>
                          <th className="border border-black p-1 w-14">Obt.</th>
                          <th className="border border-black p-1 w-8 print:hidden">
                            Gr.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {colStudents.map((s) => {
                          const grade = calculateGrade(
                            marksData[s._id]?.obtained,
                            marksData[s._id]?.total || bulkMaxMarks,
                          );
                          return (
                            <tr key={s._id} className="h-8 hover:bg-slate-50">
                              <td className="border border-black text-center font-bold">
                                {s.rollNumber}
                              </td>
                              <td className="border border-black px-2 uppercase truncate">
                                {s.name}
                              </td>
                              <td className="border border-black">
                                <input
                                  type="number"
                                  className="w-full text-center outline-none bg-transparent"
                                  value={marksData[s._id]?.total || ""}
                                  placeholder={bulkMaxMarks}
                                  onChange={(e) =>
                                    handleMarkChange(
                                      s._id,
                                      "total",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td className="border border-black">
                                <input
                                  type="text"
                                  className={`w-full text-center font-bold outline-none bg-transparent ${marksData[s._id]?.isAbsent ? "text-red-600" : ""}`}
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
                              {/* 4. GRADE CALCULATOR COLUMN */}
                              <td
                                className={`border border-black text-center font-black text-[9px] print:hidden ${grade.color}`}
                              >
                                {marksData[s._id]?.isAbsent ? "F" : grade.label}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
              <div className="mt-16 flex justify-between px-6 text-[10px] font-black uppercase italic">
                <span>Signature of Examiner: _________________</span>
                <span>Principal Signature/Seal: _________________</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-slate-50">
            <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium text-sm">
              Select criteria to load the Award List
            </p>
          </div>
        ))}

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Synchronization
              Successful
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Total</p>
              <p className="text-xl font-bold">{summary.total}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <p className="text-[10px] text-emerald-600 uppercase">Pass</p>
              <p className="text-xl font-bold text-emerald-700">
                {summary.pass}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-[10px] text-red-600 uppercase">Fail</p>
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