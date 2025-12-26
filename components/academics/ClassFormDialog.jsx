"use client";

import { useEffect } from "react";
import useSWR from "swr";

import {
  Dialog,
  DialogContent,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useForm, Controller, useFieldArray } from "react-hook-form";

/* =========================
   HELPERS
========================= */

const fetcher = (url) => fetch(url).then((r) => r.json());

const CLASSES = [
  { _id: "class-6", name: "Class 6" },
  { _id: "class-7", name: "Class 7" },
  { _id: "class-8", name: "Class 8" },
  { _id: "class-9", name: "Class 9" },
  { _id: "class-10", name: "Class 10" },
];

const SECTION_OPTIONS = ["A", "B", "C", "D"];

const getAcademicYears = (count = 5) => {
  const year = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const start = year - i;
    return `${start}-${start + 1}`;
  });
};

/* =========================
   COMPONENT
========================= */

export default function ClassFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isLoading,
}) {
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];
  
  const { control, register, handleSubmit, setValue, reset } = useForm({
    defaultValues: defaultValues || {
      name: "",
      academicYear: "",
      sections: [{ name: "A", capacity: 40, classTeacher: "" }],
      subjects: [{ name: "", code: "", teacher: "", periods: 0 }],
      feeStructure: {
        tuitionFee: 0,
        admissionFee: 0,
        examFee: 0,
        labFee: 0,
        libraryFee: 0,
        sportsFee: 0,
        computerFee: 0,
        otherFee: 0,
      },
      schedule: [],
    },
  });

  const sectionsArray = useFieldArray({ control, name: "sections" });
  const subjectsArray = useFieldArray({ control, name: "subjects" });

  /* =========================
     INITIAL SETUP
  ========================= */

  useEffect(() => {
    if (!defaultValues) {
      setValue("academicYear", getAcademicYears()[0]);

      if (!sectionsArray.fields.length) {
        sectionsArray.append({
          name: "A",
          capacity: 40,
          classTeacher: "",
        });
      }
    }
  }, []);

  function generateWeeklyPeriods(subjects, days = 6) {
    const slots = [];
    subjects.forEach((s) => {
      for (let i = 0; i < s.periods; i++) {
        slots.push({
          subjectId: s.subjectId,
          teacher: s.teacher,
        });
      }
    });

    const timetable = Array.from({ length: days }, () => []);
    slots.forEach((slot, i) => {
      timetable[i % days].push(slot);
    });

    return timetable;
  }

  useEffect(() => {
    if (!defaultValues || !subjects.length) return;

    reset({
      name: defaultValues.name,
      academicYear: defaultValues.academicYear,
      sections: defaultValues.sections?.map((s) => ({
        name: s.name,
        capacity: s.capacity,
        classTeacher: s.classTeacher?._id || s.classTeacher || "",
      })),

      subjects: defaultValues.subjects?.map((s) => {
        const meta = subjects.find(
          (x) => x.name === s.name && x.code === s.code
        );

        return {
          subjectId: meta?._id || "",
          teacher: s.teacher?._id || s.teacher || "",
          periods: s.periods,
        };
      }),

      feeStructure: defaultValues.feeStructure || {},
      schedule: defaultValues.schedule || [],
    });
  }, [defaultValues, subjects, reset]);


  /* =========================
     RENDER
  ========================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Class" : "Add Class"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => {
            const normalized = {
              ...data,
              subjects: data.subjects.map((s) => {
                const meta = subjects.find((x) => x._id === s.subjectId);
                return {
                  name: meta?.name,
                  code: meta?.code,
                  teacher: s.teacher,
                  periods: s.periods,
                };
              }),
            };
            const sectionNames = data.sections.map((s) => s.name);
            if (new Set(sectionNames).size !== sectionNames.length) {
              alert("Duplicate sections are not allowed");
              return;
            }

            const subjectIds = data.subjects.map((s) => s.subjectId);
            if (new Set(subjectIds).size !== subjectIds.length) {
              alert("Duplicate subjects are not allowed");
              return;
            }

            for (const s of data.subjects) {
              if (!s.subjectId || !s.teacher || !s.periods) {
                alert("Each subject must have subject, teacher and periods");
                return;
              }
            }

            const invalidSubject = data.subjects.some(
              (s) => !s.subjectId || !s.teacher || !s.periods
            );

            if (invalidSubject) {
              alert("Please complete all subject fields");
              return;
            }

            // onSubmit(normalized);
            const timetable = generateWeeklyPeriods(normalized.subjects);
            onSubmit({ ...normalized, timetable });
          })}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* ================= CLASS INFO ================= */}

          <div>
            <Label>Class</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c._id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label>Academic Year</Label>
            <Controller
              name="academicYear"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAcademicYears().map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* ================= SECTIONS ================= */}

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2"
                >
                  <Controller
                    name={`sections.${idx}.name`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTION_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Controller
                    name={`sections.${idx}.classTeacher`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Class Teacher" />
                        </SelectTrigger>
                        <SelectContent className="mr-2">
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Button
                    className="ml-8"
                    type="button"
                    variant="destructive"
                    onClick={() => sectionsArray.remove(idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={() =>
                  sectionsArray.append({
                    name: "A",
                    capacity: 40,
                    classTeacher: "",
                  })
                }
              >
                Add Section
              </Button>
            </CardContent>
          </Card>

          {/* ================= SUBJECTS ================= */}

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjectsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2"
                >
                  <Controller
                    name={`subjects.${idx}.subjectId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name} ({s.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Controller
                    name={`subjects.${idx}.teacher`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Teacher" />
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

                  <Input
                    type="number"
                    placeholder="Periods"
                    {...register(`subjects.${idx}.periods`, {
                      valueAsNumber: true,
                      min: 1,
                    })}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => subjectsArray.remove(idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={() =>
                  subjectsArray.append({
                    subjectId: "",
                    teacher: "",
                    periods: 1,
                  })
                }
              >
                Add Subject
              </Button>
            </CardContent>
          </Card>

          {/* ================= FOOTER ================= */}

          <div className="col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
