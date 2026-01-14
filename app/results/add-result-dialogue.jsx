// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useForm, useFieldArray, Controller } from "react-hook-form";
// import useSWR from "swr";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Plus, Trash2, User, BookOpen } from "lucide-react";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// const AddResultDialogue = ({ open, setOpen, exams, mutate }) => {
//   const [examId, setExamId] = useState("");
//   const [classId, setClassId] = useState("");
//   const [sectionId, setSectionId] = useState("");

//   /* ---------------- API DATA ---------------- */
//   const { data: studentsRes } = useSWR(
//     classId && sectionId
//       ? `/api/students?classId=${classId}&sectionId=${sectionId}`
//       : null,
//     fetcher
//   );

//   // Fetching the master list of subjects from your database
//   const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

//   const students = studentsRes?.students || [];
//   const dbSubjects = subjectsRes?.data || []; // Master list from DB

//   const exam = useMemo(
//     () => exams.find((e) => e._id === examId),
//     [examId, exams]
//   );

//   /* ---------------- FORM SETUP ---------------- */
//   const { register, handleSubmit, control, reset, setValue, watch } = useForm({
//     defaultValues: {
//       student: "",
//       subjects: [],
//     },
//   });

//   const { fields, append, remove, replace } = useFieldArray({
//     control,
//     name: "subjects",
//   });

//   /* ---------------- SIDE EFFECTS ---------------- */
//   useEffect(() => {
//     if (exam) {
//       setClassId(exam.classId._id || exam.classId);
//       setSectionId(exam.sectionId);

//       if (exam.schedule?.length > 0) {
//         const scheduleSubjects = exam.schedule.map((s) => ({
//           subject: s.subject, // This matches the subject name/ID
//           totalMarks: s.totalMarks || 100,
//           obtainedMarks: 0,
//         }));
//         replace(scheduleSubjects);
//       }
//     } else {
//       setClassId("");
//       setSectionId("");
//       replace([]);
//     }
//   }, [exam, replace]);

//   /* ---------------- SUBMIT ---------------- */
//   const onSubmit = async (data) => {
//     try {
//       if (!examId || !data.student || data.subjects.length === 0) {
//         return toast.error("Please fill all required fields");
//       }

//       const payload = {
//         exam: examId,
//         student: data.student,
//         classId,
//         sectionId,
//         academicYear: exam?.academicYear || "2025-2026",
//         subjects: data.subjects, // Now correctly using form data
//       };

//       const res = await fetch("/api/results", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error();

//       toast.success("Result saved successfully");
//       reset();
//       setExamId("");
//       setOpen(false);
//       mutate();
//     } catch (error) {
//       toast.error("Failed to save result. Check if it already exists.");
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(val) => {
//         if (!val) reset();
//         setOpen(val);
//       }}
//     >
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-xl font-bold text-indigo-600">
//             <User className="h-5 w-5" /> Add Exam Result
//           </DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* EXAM */}
//             <div className="space-y-2">
//               <Label className="font-semibold">Examination</Label>
//               <Select value={examId} onValueChange={setExamId}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choose exam..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {exams.map((e) => (
//                     <SelectItem key={e._id} value={e._id}>
//                       {e.name} ({e.classId?.name})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* STUDENT */}
//             <div className="space-y-2">
//               <Label className="font-semibold">Student</Label>
//               <Select
//                 disabled={!students.length}
//                 onValueChange={(v) => setValue("student", v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue
//                     placeholder={
//                       students.length
//                         ? "Select student..."
//                         : "Select exam first"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {students.map((s) => (
//                     <SelectItem key={s._id} value={s._id}>
//                       {s.name} ({s.rollNumber})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* SUBJECTS TABLE */}
//           <Card className="border-slate-200 shadow-sm">
//             <CardHeader className="bg-slate-50/50 py-3">
//               <CardTitle className="text-sm font-bold flex justify-between items-center">
//                 <span className="flex items-center gap-2">
//                   <BookOpen className="h-4 w-4" /> Marks Entry
//                 </span>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() =>
//                     append({ subject: "", totalMarks: 100, obtainedMarks: 0 })
//                   }
//                 >
//                   <Plus className="h-4 w-4 mr-1" /> Add Subject
//                 </Button>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-4 space-y-3">
//               <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 px-2 uppercase">
//                 <div className="col-span-5">Subject (From Database)</div>
//                 <div className="col-span-3 text-center">Total</div>
//                 <div className="col-span-3 text-center">Obtained</div>
//                 <div className="col-span-1"></div>
//               </div>

//               {fields.map((f, i) => (
//                 <div
//                   key={f._id}
//                   className="grid grid-cols-12 gap-3 items-center"
//                 >
//                   {/* DATABASE SUBJECT SELECTOR */}
//                   <div className="col-span-5">
//                     <Controller
//                       control={control}
//                       name={`subjects.${i}.subject`}
//                       render={({ field }) => (
//                         <Select
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <SelectTrigger className="bg-white">
//                             <SelectValue placeholder="Select Subject" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {dbSubjects.map((sub) => (
//                               <SelectItem key={sub._id} value={sub.name}>
//                                 {sub.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       )}
//                     />
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       type="number"
//                       {...register(`subjects.${i}.totalMarks`)}
//                       className="text-center"
//                     />
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       type="number"
//                       {...register(`subjects.${i}.obtainedMarks`, {
//                         required: true,
//                         valueAsNumber: true,
//                         max: {
//                           value: watch(`subjects.${i}.totalMarks`),
//                           message: "Exceeds total",
//                         },
//                       })}
//                       className="text-center font-bold text-indigo-600"
//                     />
//                   </div>

//                   <div className="col-span-1">
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       className="text-red-400"
//                       onClick={() => remove(i)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="ghost"
//               onClick={() => setOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" className="w-full md:w-auto bg-indigo-600">
//               Save Result Record
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddResultDialogue;

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import useSWR from "swr";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  User,
  BookOpen,
  FileUp,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url) => fetch(url).then((res) => res.json());

const AddResultDialogue = ({ open, setOpen, exams, mutate }) => {
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const fileInputRef = useRef(null);

  /* ---------------- API DATA ---------------- */
  const { data: studentsRes } = useSWR(
    classId && sectionId
      ? `/api/students?classId=${classId}&sectionId=${sectionId}`
      : null,
    fetcher
  );
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const students = studentsRes?.students || [];
  const dbSubjects = subjectsRes?.data || [];

  const exam = useMemo(
    () => exams.find((e) => e._id === examId),
    [examId, exams]
  );

  /* ---------------- FORM SETUP ---------------- */
  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: { student: "", subjects: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "subjects",
  });
  const watchedSubjects = watch("subjects");

  /* ---------------- SIDE EFFECTS ---------------- */
  useEffect(() => {
    if (exam) {
      setClassId(exam.classId._id || exam.classId);
      setSectionId(exam.sectionId);
      if (exam.schedule?.length > 0) {
        const scheduleSubjects = exam.schedule.map((s) => ({
          subject: s.subject,
          totalMarks: s.totalMarks || 100,
          obtainedMarks: 0,
          passingMarks: s.passingMarks || 33, // Defaulting to 33% if not set
        }));
        replace(scheduleSubjects);
      }
    }
  }, [exam, replace]);

  /* ---------------- BULK IMPORT ---------------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedSubjects = results.data.map((row) => ({
          subject: row.Subject || "",
          totalMarks: Number(row.TotalMarks) || 100,
          obtainedMarks: Number(row.ObtainedMarks) || 0,
          passingMarks: Number(row.PassingMarks) || 33,
        }));
        replace(importedSubjects);
        toast.success(`Imported ${importedSubjects.length} subjects from CSV`);
      },
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data) => {
    try {
      const payload = {
        exam: examId,
        student: data.student,
        classId,
        sectionId,
        academicYear: exam?.academicYear,
        subjects: data.subjects,
        status: data.subjects.some((s) => s.obtainedMarks < s.passingMarks)
          ? "Fail"
          : "Pass",
      };

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success("Result saved");
      setOpen(false);
      mutate();
    } catch (err) {
      toast.error("Failed to save. Entry might already exist.");
    }
  };

  /* ---------------- DOWNLOAD TEMPLATE ---------------- */
  const downloadTemplate = () => {
    // Define the headers based on our CSV Import logic
    const headers = ["Subject", "TotalMarks", "PassingMarks", "ObtainedMarks"];

    // Provide a few example rows to guide the teacher
    const sampleData = [
      ["Mathematics", "100", "33", ""],
      ["Science", "100", "33", ""],
      ["English", "100", "33", ""],
    ];

    const csvContent = [headers, ...sampleData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "result_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        setOpen(v);
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <User className="h-5 w-5" /> Add Exam Result
          </DialogTitle>
          <div className="flex gap-2 mr-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />

            {/* NEW: Download Template Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" /> Bulk CSV Import
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Examination</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name} - {e.classId?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                disabled={!students.length}
                onValueChange={(v) => setValue("student", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} ({s.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader className="bg-slate-50/50 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Marks Entry
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  append({
                    subject: "",
                    totalMarks: 100,
                    obtainedMarks: 0,
                    passingMarks: 33,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[10px] font-black text-slate-400 px-2 uppercase">
                <div className="col-span-4">Subject</div>
                <div className="col-span-2 text-center">Total</div>
                <div className="col-span-2 text-center">Passing</div>
                <div className="col-span-2 text-center">Obtained</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              {fields.map((f, i) => {
                const isPassing =
                  watchedSubjects[i]?.obtainedMarks >=
                  watchedSubjects[i]?.passingMarks;
                return (
                  <div
                    key={f._id}
                    className="grid grid-cols-12 gap-3 items-center group"
                  >
                    <div className="col-span-4">
                      <Controller
                        control={control}
                        name={`subjects.${i}.subject`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {dbSubjects.map((sub) => (
                                <SelectItem key={sub._id} value={sub.name}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        {...register(`subjects.${i}.totalMarks`)}
                        className="text-center h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        {...register(`subjects.${i}.passingMarks`)}
                        className="text-center h-9 bg-orange-50/30 border-orange-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        {...register(`subjects.${i}.obtainedMarks`, {
                          valueAsNumber: true,
                        })}
                        className={`text-center h-9 font-bold ${
                          isPassing ? "text-green-600" : "text-red-600"
                        }`}
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      {isPassing ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex gap-1">
                          <CheckCircle2 size={12} /> Pass
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none flex gap-1">
                          <XCircle size={12} /> Fail
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400"
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <DialogFooter className="border-t pt-4">
            <div className="flex-grow flex items-center text-sm">
              <span className="font-semibold text-slate-500">
                Overall Result:{" "}
              </span>
              {watchedSubjects.length > 0 &&
                (watchedSubjects.every(
                  (s) => s.obtainedMarks >= s.passingMarks
                ) ? (
                  <span className="ml-2 text-green-600 font-bold uppercase tracking-wider">
                    Pass
                  </span>
                ) : (
                  <span className="ml-2 text-red-600 font-bold uppercase tracking-wider">
                    Fail (Promoted/Failed)
                  </span>
                ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              {" "}
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 px-8">
              Save Result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResultDialogue;
