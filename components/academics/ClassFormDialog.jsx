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
  School,
  Sparkles,
} from "lucide-react";
import { academicYears } from "@/lib/constants"; // Imported as requested

const fetcher = (url) => fetch(url).then((r) => r.json());

const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

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

  const { control, register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      academicYear: "",
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

  // Handle Edit Population
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        academicYear: defaultValues.academicYear || "",
        sections: defaultValues.sections?.map((s) => ({
          name: s.name,
          capacity: s.capacity || 40,
          classTeacher: s.classTeacher?._id || s.classTeacher || "",
        })) || [{ name: "A", capacity: 40, classTeacher: "" }],
        subjects: defaultValues.subjects?.map((sub) => ({
          subjectId: sub.subjectId?._id || sub.subjectId || "",
          teacher: sub.teacher?._id || sub.teacher || "",
          periods: sub.periods || 1,
        })) || [{ subjectId: "", teacher: "", periods: 1 }],
      });
    } else {
      reset({
        name: "",
        academicYear: academicYears[0] || "",
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
      });
    }
  }, [defaultValues, reset, open]);

  const sectionsArray = useFieldArray({ control, name: "sections" });
  const subjectsArray = useFieldArray({ control, name: "subjects" });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleFinalSubmit = (data) => {
    // Normalize data for API
    const normalizedSubjects = data.subjects.map((s) => {
      const meta = subjects.find((x) => x._id === s.subjectId);
      return { ...s, name: meta?.name, code: meta?.code };
    });
    onSubmit({ ...data, subjects: normalizedSubjects });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setStep(1);
      }}
    >
      <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Header Branding */}
        <div className="bg-zinc-950 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <School size={120} />
          </div>

          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 text-primary-foreground p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                <Sparkles size={16} className="text-blue-400" />
              </div>
              <Badge
                variant="outline"
                className="text-zinc-400 border-zinc-700 font-mono"
              >
                PHASE 0{step} _
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter italic">
              {defaultValues ? "EDIT CLASS CONFIG" : "NEW CLASS ARCHITECTURE"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium">
              {step === 1 && "Define identity and section capacity"}
              {step === 2 && "Map curriculum and faculty workloads"}
              {step === 3 && "Financial structure and verification"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-8 relative z-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= step
                      ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      : "bg-zinc-800"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFinalSubmit)} className="p-8">
          <div className="min-h-[420px]">
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
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
                          <SelectTrigger className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/50 focus:ring-2">
                            <SelectValue placeholder="Select Grade" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
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
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Academic Year
                    </Label>
                    <Controller
                      name="academicYear"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/50">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {academicYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-black text-sm tracking-tight italic">
                        Section Allocation
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Assign physical sections and class teachers
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        sectionsArray.append({ name: "", capacity: 40 })
                      }
                      className="rounded-xl border-dashed border-2 hover:bg-zinc-50 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <Plus className="h-3 w-3 mr-1 text-blue-500" /> Add
                      Section
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {sectionsArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="group flex gap-4 items-center bg-white p-4 rounded-[1.5rem] border border-zinc-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
                      >
                        <div className="w-24">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">
                            Section
                          </Label>
                          <Controller
                            name={`sections.${idx}.name`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-10 rounded-xl bg-zinc-50 border-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SECTION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">
                            Class Teacher
                          </Label>
                          <Controller
                            name={`sections.${idx}.classTeacher`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-10 rounded-xl bg-zinc-50 border-none">
                                  <SelectValue placeholder="Assign Faculty" />
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
                        <div className="w-20">
                          <Label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">
                            Cap.
                          </Label>
                          <Input
                            type="number"
                            {...register(`sections.${idx}.capacity`)}
                            className="h-10 rounded-xl bg-zinc-50 border-none text-center font-bold"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => sectionsArray.remove(idx)}
                          className="mt-5 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CURRICULUM */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="font-black italic tracking-tight">
                      Academic Workload
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
                    className="rounded-xl bg-zinc-900 shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Subject
                  </Button>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {subjectsArray.fields.map((field, idx) => (
                    <Card
                      key={field.id}
                      className="border-zinc-100 shadow-none rounded-[1.5rem] bg-zinc-50/30 overflow-hidden group"
                    >
                      <CardContent className="p-5 grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-4 space-y-2">
                          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
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
                                <SelectTrigger className="rounded-xl bg-white border-zinc-200 h-10">
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
                        <div className="col-span-5 space-y-2">
                          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Faculty Member
                          </Label>
                          <Controller
                            name={`subjects.${idx}.teacher`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="rounded-xl bg-white border-zinc-200 h-10">
                                  <SelectValue placeholder="Assign" />
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
                          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            P/W
                          </Label>
                          <Input
                            type="number"
                            {...register(`subjects.${idx}.periods`)}
                            className="rounded-xl bg-white border-zinc-200 h-10 text-center font-bold"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => subjectsArray.remove(idx)}
                            className="text-zinc-300 hover:text-red-500 transition-colors"
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

            {/* STEP 3: FINANCIALS */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Wallet size={20} />
                  </div>
                  <h3 className="font-black italic tracking-tight">
                    Fee Structure Setup
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                  {Object.keys(watch("feeStructure")).map((fee) => (
                    <div key={fee} className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em]">
                        {fee.replace(/([A-Z])/g, " $1")}
                      </Label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">
                          $
                        </span>
                        <Input
                          type="number"
                          {...register(`feeStructure.${fee}`)}
                          className="pl-8 h-12 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-[2rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black italic tracking-tight text-blue-900">
                        Automation Enabled
                      </p>
                      <p className="text-[11px] text-blue-600 font-medium">
                        Timetables and period distribution will be generated
                        upon finalization.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500 text-white rounded-lg border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Active
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-12 gap-3 border-t border-zinc-100 pt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                className="rounded-2xl px-6 h-12 font-bold text-zinc-500 hover:bg-zinc-100"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            <div className="flex-1" />

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-12 rounded-2xl px-10 bg-zinc-900 text-white shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all"
              >
                Next Phase <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 rounded-2xl px-12 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all font-black italic tracking-tight"
              >
                {isLoading ? "PROVISIONING..." : "FINALIZE CONFIGURATION"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
