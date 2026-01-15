// "use client";

// import { useEffect } from "react";
// import useSWR from "swr";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// import { useForm, Controller, useFieldArray } from "react-hook-form";

// /* =========================
//    HELPERS
// ========================= */

// const fetcher = (url) => fetch(url).then((r) => r.json());

// const CLASSES = [
//   { _id: "class-6", name: "Class 6" },
//   { _id: "class-7", name: "Class 7" },
//   { _id: "class-8", name: "Class 8" },
//   { _id: "class-9", name: "Class 9" },
//   { _id: "class-10", name: "Class 10" },
// ];

// const SECTION_OPTIONS = ["A", "B", "C", "D"];

// const getAcademicYears = (count = 5) => {
//   const year = new Date().getFullYear();
//   return Array.from({ length: count }, (_, i) => {
//     const start = year - i;
//     return `${start}-${start + 1}`;
//   });
// };

// /* =========================
//    COMPONENT
// ========================= */

// export default function ClassFormDialog({
//   open,
//   onOpenChange,
//   onSubmit,
//   defaultValues,
//   isLoading,
// }) {
//   const { data: teachersRes } = useSWR("/api/teachers", fetcher);
//   const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

//   const teachers = teachersRes?.teachers || [];
//   const subjects = subjectsRes?.data || [];
  
//   const { control, register, handleSubmit, setValue, reset } = useForm({
//     defaultValues: defaultValues || {
//       name: "",
//       academicYear: "",
//       sections: [{ name: "A", capacity: 40, classTeacher: "" }],
//       subjects: [{ name: "", code: "", teacher: "", periods: 0 }],
//       feeStructure: {
//         tuitionFee: 0,
//         admissionFee: 0,
//         examFee: 0,
//         labFee: 0,
//         libraryFee: 0,
//         sportsFee: 0,
//         computerFee: 0,
//         otherFee: 0,
//       },
//       schedule: [],
//     },
//   });

//   const sectionsArray = useFieldArray({ control, name: "sections" });
//   const subjectsArray = useFieldArray({ control, name: "subjects" });

//   /* =========================
//      INITIAL SETUP
//   ========================= */

//   useEffect(() => {
//     if (!defaultValues) {
//       setValue("academicYear", getAcademicYears()[0]);

//       if (!sectionsArray.fields.length) {
//         sectionsArray.append({
//           name: "A",
//           capacity: 40,
//           classTeacher: "",
//         });
//       }
//     }
//   }, []);

//   function generateWeeklyPeriods(subjects, days = 6) {
//     const slots = [];
//     subjects.forEach((s) => {
//       for (let i = 0; i < s.periods; i++) {
//         slots.push({
//           subjectId: s.subjectId,
//           teacher: s.teacher,
//         });
//       }
//     });

//     const timetable = Array.from({ length: days }, () => []);
//     slots.forEach((slot, i) => {
//       timetable[i % days].push(slot);
//     });

//     return timetable;
//   }

//   useEffect(() => {
//     if (!defaultValues || !subjects.length) return;

//     reset({
//       name: defaultValues.name,
//       academicYear: defaultValues.academicYear,
//       sections: defaultValues.sections?.map((s) => ({
//         name: s.name,
//         capacity: s.capacity,
//         classTeacher: s.classTeacher?._id || s.classTeacher || "",
//       })),

//       subjects: defaultValues.subjects?.map((s) => {
//         const meta = subjects.find(
//           (x) => x.name === s.name && x.code === s.code
//         );

//         return {
//           subjectId: meta?._id || "",
//           teacher: s.teacher?._id || s.teacher || "",
//           periods: s.periods,
//         };
//       }),

//       feeStructure: defaultValues.feeStructure || {},
//       schedule: defaultValues.schedule || [],
//     });
//   }, [defaultValues, subjects, reset]);


//   /* =========================
//      RENDER
//   ========================= */

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl rounded-2xl">
//         <DialogHeader>
//           <DialogTitle>
//             {defaultValues ? "Edit Class" : "Add Class"}
//           </DialogTitle>
//         </DialogHeader>

//         <form
//           onSubmit={handleSubmit((data) => {
//             const normalized = {
//               ...data,
//               subjects: data.subjects.map((s) => {
//                 const meta = subjects.find((x) => x._id === s.subjectId);
//                 return {
//                   name: meta?.name,
//                   code: meta?.code,
//                   teacher: s.teacher,
//                   periods: s.periods,
//                 };
//               }),
//             };
//             const sectionNames = data.sections.map((s) => s.name);
//             if (new Set(sectionNames).size !== sectionNames.length) {
//               alert("Duplicate sections are not allowed");
//               return;
//             }

//             const subjectIds = data.subjects.map((s) => s.subjectId);
//             if (new Set(subjectIds).size !== subjectIds.length) {
//               alert("Duplicate subjects are not allowed");
//               return;
//             }

//             for (const s of data.subjects) {
//               if (!s.subjectId || !s.teacher || !s.periods) {
//                 alert("Each subject must have subject, teacher and periods");
//                 return;
//               }
//             }

//             const invalidSubject = data.subjects.some(
//               (s) => !s.subjectId || !s.teacher || !s.periods
//             );

//             if (invalidSubject) {
//               alert("Please complete all subject fields");
//               return;
//             }

//             // onSubmit(normalized);
//             const timetable = generateWeeklyPeriods(normalized.subjects);
//             onSubmit({ ...normalized, timetable });
//           })}
//           className="grid grid-cols-1 md:grid-cols-2 gap-6"
//         >
//           {/* ================= CLASS INFO ================= */}

//           <div>
//             <Label>Class</Label>
//             <Controller
//               name="name"
//               control={control}
//               rules={{ required: true }}
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Class" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {CLASSES.map((c) => (
//                       <SelectItem key={c._id} value={c.name}>
//                         {c.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>

//           <div>
//             <Label>Academic Year</Label>
//             <Controller
//               name="academicYear"
//               control={control}
//               rules={{ required: true }}
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Year" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {getAcademicYears().map((year) => (
//                       <SelectItem key={year} value={year}>
//                         {year}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>

//           {/* ================= SECTIONS ================= */}

//           <Card className="col-span-2">
//             <CardHeader>
//               <CardTitle>Sections</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {sectionsArray.fields.map((field, idx) => (
//                 <div
//                   key={field.id}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-2"
//                 >
//                   <Controller
//                     name={`sections.${idx}.name`}
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Section" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {SECTION_OPTIONS.map((s) => (
//                             <SelectItem key={s} value={s}>
//                               {s}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   />

//                   <Controller
//                     name={`sections.${idx}.classTeacher`}
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Class Teacher" />
//                         </SelectTrigger>
//                         <SelectContent className="mr-2">
//                           {teachers.map((t) => (
//                             <SelectItem key={t._id} value={t._id}>
//                               {t.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   />

//                   <Button
//                     className="ml-8"
//                     type="button"
//                     variant="destructive"
//                     onClick={() => sectionsArray.remove(idx)}
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               ))}

//               <Button
//                 type="button"
//                 onClick={() =>
//                   sectionsArray.append({
//                     name: "A",
//                     capacity: 40,
//                     classTeacher: "",
//                   })
//                 }
//               >
//                 Add Section
//               </Button>
//             </CardContent>
//           </Card>

//           {/* ================= SUBJECTS ================= */}

//           <Card className="col-span-2">
//             <CardHeader>
//               <CardTitle>Subjects</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {subjectsArray.fields.map((field, idx) => (
//                 <div
//                   key={field.id}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-2"
//                 >
//                   <Controller
//                     name={`subjects.${idx}.subjectId`}
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select Subject" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {subjects.map((s) => (
//                             <SelectItem key={s._id} value={s._id}>
//                               {s.name} ({s.code})
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   />

//                   <Controller
//                     name={`subjects.${idx}.teacher`}
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Teacher" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {teachers.map((t) => (
//                             <SelectItem key={t._id} value={t._id}>
//                               {t.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   />

//                   <Input
//                     type="number"
//                     placeholder="Periods"
//                     {...register(`subjects.${idx}.periods`, {
//                       valueAsNumber: true,
//                       min: 1,
//                     })}
//                   />

//                   <Button
//                     type="button"
//                     variant="destructive"
//                     onClick={() => subjectsArray.remove(idx)}
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               ))}

//               <Button
//                 type="button"
//                 onClick={() =>
//                   subjectsArray.append({
//                     subjectId: "",
//                     teacher: "",
//                     periods: 1,
//                   })
//                 }
//               >
//                 Add Subject
//               </Button>
//             </CardContent>
//           </Card>

//           {/* ================= FOOTER ================= */}

//           <div className="col-span-2 flex justify-end gap-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               Save Class
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Wallet,
  Calendar,
} from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTION_OPTIONS = ["A", "B", "C", "D"];

export default function ClassFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isLoading,
}) {
  const [step, setStep] = useState(1);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];

  const { control, register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: defaultValues || {
      name: "",
      academicYear: new Date().getFullYear().toString(),
      sections: [{ name: "A", capacity: 40, classTeacher: "" }],
      subjects: [{ subjectId: "", teacher: "", periods: 1 }],
      feeStructure: {
        tuitionFee: 0,
        admissionFee: 0,
        examFee: 0,
        labFee: 0,
        libraryFee: 0,
        otherFee: 0,
      },
    },
  });

  const sectionsArray = useFieldArray({ control, name: "sections" });
  const subjectsArray = useFieldArray({ control, name: "subjects" });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Auto-generate timetable logic
  function generateWeeklyPeriods(data) {
    const days = 6;
    const timetable = Array.from({ length: days }, () => []);
    const slots = [];

    data.subjects.forEach((s) => {
      const meta = subjects.find((sub) => sub._id === s.subjectId);
      for (let i = 0; i < s.periods; i++) {
        slots.push({ name: meta?.name, teacher: s.teacher });
      }
    });

    slots.forEach((slot, i) => timetable[i % days].push(slot));
    return timetable;
  }

  const handleFinalSubmit = (data) => {
    const timetable = generateWeeklyPeriods(data);
    const normalizedSubjects = data.subjects.map((s) => {
      const meta = subjects.find((x) => x._id === s.subjectId);
      return { ...s, name: meta?.name, code: meta?.code };
    });
    onSubmit({ ...data, subjects: normalizedSubjects, timetable });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setStep(1);
      }}
    >
      <DialogContent className="max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-zinc-900 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-zinc-400 border-zinc-700"
              >
                Step {step} of 3
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-black italic tracking-tighter">
              {defaultValues ? "Update Academic Class" : "Configure New Class"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {step === 1 && "Basic setup and section allocation"}
              {step === 2 && "Subject assignments and workload"}
              {step === 3 && "Fee structure and scheduling"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleFinalSubmit)}
          className="p-8 bg-white"
        >
          <div className="min-h-[400px]">
            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Class Level
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="rounded-xl border-zinc-200">
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASSES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Academic Year
                    </Label>
                    <Input
                      {...register("academicYear")}
                      className="rounded-xl"
                      placeholder="2025-2026"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Section Assignments
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        sectionsArray.append({ name: "A", capacity: 40 })
                      }
                      className="text-primary font-bold text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Section
                    </Button>
                  </div>
                  {sectionsArray.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex gap-3 items-end bg-zinc-50 p-3 rounded-2xl border border-zinc-100"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] uppercase font-bold text-zinc-400">
                          Name
                        </Label>
                        <Input
                          {...register(`sections.${idx}.name`)}
                          placeholder="A"
                          className="bg-white"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] uppercase font-bold text-zinc-400">
                          Teacher
                        </Label>
                        <Controller
                          name={`sections.${idx}.classTeacher`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((t) => (
                                  <SelectItem key={t._id} value={t._id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => sectionsArray.remove(idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SUBJECTS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <BookOpen size={18} />
                    </div>
                    <h3 className="font-bold tracking-tight">
                      Curriculum Management
                    </h3>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      subjectsArray.append({
                        subjectId: "",
                        teacher: "",
                        periods: 1,
                      })
                    }
                    className="rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Subject
                  </Button>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
                  {subjectsArray.fields.map((field, idx) => (
                    <Card
                      key={field.id}
                      className="border-zinc-100 shadow-none rounded-2xl"
                    >
                      <CardContent className="p-4 grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-4 space-y-2">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase">
                            Subject
                          </Label>
                          <Controller
                            name={`subjects.${idx}.subjectId`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="col-span-4 space-y-2">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase">
                            Faculty
                          </Label>
                          <Controller
                            name={`subjects.${idx}.teacher`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers.map((t) => (
                                    <SelectItem key={t._id} value={t._id}>
                                      {t.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase">
                            Periods/Wk
                          </Label>
                          <Input
                            type="number"
                            {...register(`subjects.${idx}.periods`)}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => subjectsArray.remove(idx)}
                            className="text-zinc-300 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: FEES & PREVIEW */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Wallet size={18} />
                  </div>
                  <h3 className="font-bold tracking-tight">Fee Structure</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                  {[
                    "tuitionFee",
                    "admissionFee",
                    "examFee",
                    "labFee",
                    "libraryFee",
                    "otherFee",
                  ].map((fee) => (
                    <div key={fee} className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-500">
                        {fee.replace(/([A-Z])/g, " $1")}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                          $
                        </span>
                        <Input
                          type="number"
                          {...register(`feeStructure.${fee}`)}
                          className="pl-7 bg-white rounded-xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-zinc-400" />
                    <div>
                      <p className="text-sm font-bold">
                        Timetable Distribution
                      </p>
                      <p className="text-xs text-zinc-500">
                        Weekly periods will be auto-calculated across 6 days.
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-lg">
                    Automated
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 gap-3 border-t pt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="rounded-xl px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl px-10 bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                {isLoading ? "Saving..." : "Finalize Class"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}