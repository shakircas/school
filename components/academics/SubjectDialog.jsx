"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { MultiSelect } from "./MultiSelect";

const subjectsKPK = [
  { value: "urdu", label: "Urdu", code: "URD" },
  { value: "english", label: "English", code: "ENG" },
  { value: "mathematics", label: "Mathematics", code: "MATH" },
  { value: "physics", label: "Physics", code: "PHY" },
  { value: "chemistry", label: "Chemistry", code: "CHEM" },
  { value: "biology", label: "Biology", code: "BIO" },
  { value: "islamiyat", label: "Islamiyat", code: "ISL" },
  { value: "pak_studies", label: "Pakistan Studies", code: "PAK" },
  { value: "drawing", label: "Drawing", code: "DRAW" },
  { value: "computer_science", label: "Computer Science", code: "CS" },
  { value: "geography", label: "Geography", code: "GEO" },
  { value: "history", label: "History", code: "HIST" },
  { value: "Mutala_Quran", label: "Mutala Quran", code: "MQ" },
];

function generateSubjectCode(subjectValue, classIds, classes) {
  if (!subjectValue || !classIds?.length) return "";

  const subject = subjectsKPK.find((s) => s.value === subjectValue);
  if (!subject) return "";

  // take first class (subject usually linked to many, but code is per class)
  const cls = classes.find((c) => c._id === classIds[0]);
  if (!cls) return subject.code;

  const classNumber = cls.name.match(/\d+/)?.[0];
  return classNumber ? `${subject.code}-${classNumber}` : subject.code;
}

export default function SubjectDialog({
  open,
  onOpenChange,
  onSubmit,
  register,
  errors,
  setValue,
  watch,
  classes = [],
  teachers = [],
  selectedSubject = null,
}) {
  // Populate form when editing
  useEffect(() => {
    if (!selectedSubject) return;

    setValue("name", selectedSubject.name);
    setValue("code", selectedSubject.code);
    setValue("type", selectedSubject.type || "Compulsory");
    setValue("classes", selectedSubject.classes?.map((c) => c._id) || []);
    setValue("teachers", selectedSubject.teachers?.map((t) => t._id) || []);
  }, [selectedSubject, setValue]);

  useEffect(() => {
    const subjectValue = watch("name");
    const classIds = watch("classes");

    const code = generateSubjectCode(subjectValue, classIds, classes);
    setValue("code", code);
  }, [watch("name"), watch("classes"), classes, setValue]);

  console.log(teachers);

 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
       <DialogHeader className="p-8 bg-slate-900 text-white">
         <DialogTitle className="text-2xl font-bold">
           {selectedSubject ? "Modify Subject" : "New Curriculum Subject"}
         </DialogTitle>
         <p className="text-slate-400 text-sm">
           Fill in the details to define subject scope and faculty.
         </p>
       </DialogHeader>

       <form onSubmit={onSubmit} className="p-8 space-y-6 bg-white">
         <div className="grid grid-cols-2 gap-6">
           <div className="col-span-2 md:col-span-1 space-y-2">
             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
               Subject Name
             </Label>
             <Select
               value={watch("name")}
               onValueChange={(v) => setValue("name", v)}
             >
               <SelectTrigger className="rounded-xl border-slate-200 h-11">
                 <SelectValue placeholder="Select Subject" />
               </SelectTrigger>
               <SelectContent>
                 {subjectsKPK.map((sub) => (
                   <SelectItem key={sub.value} value={sub.value}>
                     {sub.label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <div className="col-span-2 md:col-span-1 space-y-2">
             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
               Subject Code
             </Label>
             <Input
               {...register("code")}
               disabled
               className="rounded-xl bg-slate-50 h-11 border-slate-200 font-mono font-bold text-primary"
             />
           </div>
         </div>

         <div className="space-y-2">
           <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
             Assignment Type
           </Label>
           <div className="grid grid-cols-3 gap-3">
             {["Compulsory", "Elective", "Optional"].map((type) => (
               <button
                 type="button"
                 key={type}
                 onClick={() => setValue("type", type)}
                 className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                   watch("type") === type
                     ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                     : "bg-white text-slate-600 border-slate-200 hover:border-primary"
                 }`}
               >
                 {type}
               </button>
             ))}
           </div>
         </div>

         <div className="space-y-4 pt-4 border-t border-slate-100">
           <div className="space-y-2">
             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
               Target Classes
             </Label>
             <MultiSelect
               options={classes.map((c) => ({ value: c._id, label: c.name }))}
               value={watch("classes") || []}
               onChange={(v) => setValue("classes", v)}
             />
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
               Assigned Teachers
             </Label>
             <MultiSelect
               options={teachers.map((t) => ({ value: t._id, label: t.name }))}
               value={watch("teachers") || []}
               onChange={(v) => setValue("teachers", v)}
             />
           </div>
         </div>

         <DialogFooter className="pt-6">
           <Button
             type="submit"
             className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
           >
             {selectedSubject ? "Save Changes" : "Create Subject"}
           </Button>
         </DialogFooter>
       </form>
     </DialogContent>
   </Dialog>
 );
}
