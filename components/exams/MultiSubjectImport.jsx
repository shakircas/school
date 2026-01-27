// "use client";

// import { useState } from "react";
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
//   FileUp,
//   FileDown,
//   Loader2,
//   Save,
//   Table as TableIcon,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "sonner";
// import * as XLSX from "xlsx";
// import { PageHeader } from "../ui/page-header";

// const fetcher = (url) => fetch(url).then((r) => r.json());

// export default function MultiSubjectImport() {
//   const [classId, setClassId] = useState("");
//   const [examId, setExamId] = useState("");
//   const [sectionId, setSectionId] = useState("A");
//   const [isSaving, setIsSaving] = useState(false);
//   const [importPreview, setImportPreview] = useState([]);

//   const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
//   const { data: examsRes } = useSWR("/api/exams", fetcher);
//   const { data: subjectsRes } = useSWR(
//     classId ? `/api/academics/subjects?classId=${classId}` : null,
//     fetcher,
//   );
//   const { data: studentsRes } = useSWR(
//     classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null,
//     fetcher,
//   );

//   const students = studentsRes?.students || [];
//   const subjects = subjectsRes?.data || [];

//   // 1. GENERATE MULTI-SUBJECT TEMPLATE
//   const downloadTemplate = () => {
//     if (!classId || subjects.length === 0)
//       return toast.error("Select class with subjects first");

//     const templateData = students.map((s) => {
//       const row = {
//         "Roll Number": s.rollNumber,
//         "Student Name": s.name,
//         "Student ID": s._id.toString(),
//       };
//       // Create columns for each subject
//       subjects.forEach((sub) => {
//         row[`${sub.name} (Obtained)`] = "";
//         row[`${sub.name} (Total)`] = 100;
//       });
//       return row;
//     });

//     const ws = XLSX.utils.json_to_sheet(templateData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Bulk Marks");
//     XLSX.writeFile(wb, `Whole_Class_Result_Template.xlsx`);
//   };

//   // 2. PARSE MULTI-SUBJECT EXCEL
//   const handleImport = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const data = new Uint8Array(event.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const jsonData = XLSX.utils.sheet_to_json(
//         workbook.Sheets[workbook.SheetNames[0]],
//       );

//       // We keep data in state to show a "Review Grid" before saving
//       setImportPreview(jsonData);
//       toast.info(
//         `Loaded ${jsonData.length} student records. Click Save to sync.`,
//       );
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // 3. SEND TO NEW MULTI-SUBJECT API
//   const handleBulkSave = async () => {
//     if (!examId || importPreview.length === 0)
//       return toast.error("Select Exam and Import File");

//     setIsSaving(true);
//     try {
//       const res = await fetch("/api/results/bulk-multi-subject", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           examId,
//           classId,
//           sectionId,
//           data: importPreview,
//           subjectList: subjects.map((s) => s.name), // Pass valid subjects for verification
//         }),
//       });

//       if (!res.ok) throw new Error("Bulk upload failed");
//       toast.success("Whole class marks updated successfully!");
//       setImportPreview([]);
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="p-4 space-y-6">
//       <PageHeader
//         title="Whole Class Import"
//         description="Upload marks for all subjects at once"
//       >
//         <Button
//           variant="outline"
//           onClick={downloadTemplate}
//           disabled={!classId}
//         >
//           <FileDown className="mr-2 h-4 w-4" /> Template
//         </Button>
//         <div className="relative">
//           <input
//             type="file"
//             className="absolute inset-0 opacity-0"
//             onChange={handleImport}
//             accept=".xlsx"
//           />
//           <Button variant="secondary">
//             <FileUp className="mr-2 h-4 w-4" /> Upload Excel
//           </Button>
//         </div>
//         <Button
//           onClick={handleBulkSave}
//           disabled={isSaving || importPreview.length === 0}
//           className="bg-indigo-600"
//         >
//           {isSaving ? (
//             <Loader2 className="animate-spin mr-2" />
//           ) : (
//             <Save className="mr-2 h-4 w-4" />
//           )}
//           Save All Subjects
//         </Button>
//       </PageHeader>

//       <div className="grid grid-cols-3 gap-4">
//         <Select value={examId} onValueChange={setExamId}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select Exam" />
//           </SelectTrigger>
//           <SelectContent>
//             {examsRes?.data?.map((e) => (
//               <SelectItem key={e._id} value={e._id}>
//                 {e.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={classId} onValueChange={setClassId}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select Class" />
//           </SelectTrigger>
//           <SelectContent>
//             {classesRes?.data?.map((c) => (
//               <SelectItem key={c._id} value={c._id}>
//                 {c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {importPreview.length > 0 && (
//         <Card>
//           <CardContent className="pt-6">
//             <div className="overflow-x-auto max-h-[500px]">
//               <table className="w-full text-xs border-collapse">
//                 <thead>
//                   <tr className="bg-slate-100">
//                     {Object.keys(importPreview[0]).map((k) => (
//                       <th
//                         key={k}
//                         className="border p-2 text-left whitespace-nowrap"
//                       >
//                         {k}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {importPreview.map((row, i) => (
//                     <tr key={i} className="hover:bg-slate-50">
//                       {Object.values(row).map((val, j) => (
//                         <td key={j} className="border p-2">
//                           {val}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

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
import {
  FileUp,
  FileDown,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { PageHeader } from "../ui/page-header";
import { Badge } from "@/components/ui/badge";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function MultiSubjectImport() {
  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const [isSaving, setIsSaving] = useState(false);
  const [importPreview, setImportPreview] = useState([]);

  // Data Fetching
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: subjectsRes } = useSWR(
    classId ? `/api/academics/subjects?classId=${classId}` : null,
    fetcher,
  );
  const { data: studentsRes } = useSWR(
    classId ? `/api/students?classId=${classId}&sectionId=${sectionId}` : null,
    fetcher,
  );

  const students = studentsRes?.students || [];
  const subjects = subjectsRes?.data || [];

  // --- 1. MODERN VALIDATION LOGIC ---
  const validatedData = useMemo(() => {
    return importPreview.map((row) => {
      const errors = [];
      subjects.forEach((sub) => {
        const obt = row[`${sub.name} (Obtained)`];
        const tot = row[`${sub.name} (Total)`];

        // Rules: Marks can't be greater than total, must be numbers or 'ABS'
        if (obt !== undefined && obt !== "") {
          if (String(obt).toUpperCase() !== "ABS" && isNaN(Number(obt))) {
            errors.push(`${sub.name}: Invalid Mark`);
          }
          if (Number(obt) > Number(tot)) {
            errors.push(`${sub.name}: Obtained > Total`);
          }
        }
      });

      // Check if Student ID exists in our current class fetch
      const studentExists = students.some((s) => s._id === row["Student ID"]);
      if (!studentExists) errors.push("Student ID Mismatch");

      return { ...row, _errors: errors };
    });
  }, [importPreview, subjects, students]);

  const totalErrors = validatedData.reduce(
    (acc, row) => acc + row._errors.length,
    0,
  );

  // --- 2. TEMPLATE GENERATOR ---
  const downloadTemplate = () => {
    if (!classId || subjects.length === 0)
      return toast.error("Select class with subjects first");

    const templateData = students.map((s) => {
      const row = {
        "Roll Number": s.rollNumber,
        "Student Name": s.name,
        "Student ID": s._id.toString(),
      };
      subjects.forEach((sub) => {
        row[`${sub.name} (Obtained)`] = "";
        row[`${sub.name} (Total)`] = 100;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bulk Marks");
    XLSX.writeFile(wb, `${classId}_Full_Class_Template.xlsx`);
  };

  // --- 3. EXCEL PARSER ---
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const jsonData = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]],
          { defval: "" },
        );
        setImportPreview(jsonData);
        toast.success(`Previewing ${jsonData.length} records`);
      } catch (err) {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- 4. SYNC TO DATABASE ---
  const handleBulkSave = async () => {
    if (totalErrors > 0) return toast.error("Please fix errors before saving");

    setIsSaving(true);
    try {
      const res = await fetch("/api/results/bulk-multi-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          classId,
          sectionId,
          data: validatedData,
          subjectList: subjects.map((s) => s.name),
        }),
      });

      if (!res.ok) throw new Error("Server error during bulk sync");

      //   toast.success("All subjects synchronized successfully!");
      // Show a detailed success message
      toast.success(
        <div>
          <p className="font-bold">Sync Successful!</p>
          <p className="text-xs">Records Created: {result.summary.created}</p>
          <p className="text-xs">Records Updated: {result.summary.updated}</p>
        </div>,
      );
      setImportPreview([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Whole Class Import"
        description="Sync all subjects in one click"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={!classId}
          >
            <FileDown className="mr-2 h-4 w-4" /> Template
          </Button>
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImport}
              accept=".xlsx"
            />
            <Button variant="secondary">
              <FileUp className="mr-2 h-4 w-4" /> Load File
            </Button>
          </div>
          <Button
            onClick={handleBulkSave}
            disabled={isSaving || importPreview.length === 0 || totalErrors > 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Sync to Database
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {examsRes?.data?.map((e) => (
              <SelectItem key={e._id} value={e._id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classesRes?.data?.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalErrors > 0 && (
          <div className="col-span-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            <XCircle className="h-4 w-4" />
            <strong>{totalErrors} Errors Found:</strong> Correct the red cells
            in your Excel and re-upload.
          </div>
        )}
      </div>

      {importPreview.length > 0 && (
        <Card className="border-none shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white sticky top-0 z-10">
                    <th className="p-3 text-left min-w-[150px]">
                      Student Details
                    </th>
                    {subjects.map((sub) => (
                      <th
                        key={sub._id}
                        className="p-3 text-center border-l border-slate-700"
                      >
                        {sub.name}
                      </th>
                    ))}
                    <th className="p-3 text-right sticky right-0 bg-slate-800">
                      Validation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {validatedData.map((row, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-slate-50 ${row._errors.length > 0 ? "bg-red-50/50" : ""}`}
                    >
                      <td className="p-3 border-r">
                        <div className="font-bold text-slate-900 uppercase">
                          {row["Student Name"]}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {row["Student ID"]}
                        </div>
                      </td>
                      {subjects.map((sub) => {
                        const obt = row[`${sub.name} (Obtained)`];
                        const tot = row[`${sub.name} (Total)`];
                        const isInvalid = Number(obt) > Number(tot);
                        return (
                          <td
                            key={sub._id}
                            className={`p-3 text-center border-r ${isInvalid ? "bg-red-100" : ""}`}
                          >
                            <div
                              className={`font-bold text-sm ${obt === "ABS" ? "text-red-500" : "text-slate-700"}`}
                            >
                              {obt || "—"}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              / {tot}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-right sticky right-0 bg-white/90 backdrop-blur-sm border-l">
                        {row._errors.length > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            {row._errors.slice(0, 1).map((err, eIdx) => (
                              <Badge
                                key={eIdx}
                                variant="destructive"
                                className="text-[9px] px-1 py-0"
                              >
                                {err}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 bg-emerald-50 border-emerald-200"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> OK
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
