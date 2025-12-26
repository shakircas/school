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
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedSubject ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Subject Dropdown */}
          <div className="space-y-2">
            <Label>Subject Name</Label>
            <Select
              value={watch("name")}
              onValueChange={(value) => {
                const selected = subjectsKPK.find((s) => s.value === value);
                setValue("name", value, { shouldValidate: true });
                setValue("code", selected?.code || "", {
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger>
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

            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Subject Code */}

          <div className="space-y-2">
            <Label>Subject Code</Label>
            <Select value={watch("code")} disabled>
              <SelectTrigger>
                <SelectValue placeholder="Auto-generated code" />
              </SelectTrigger>
              <SelectContent>
                {subjectsKPK.map((sub) => (
                  <SelectItem key={sub.code} value={sub.code}>
                    {sub.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Type */}
          <div className="space-y-2">
            <Label>Subject Type</Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => setValue("type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compulsory">Compulsory</SelectItem>
                <SelectItem value="Elective">Elective</SelectItem>
                <SelectItem value="Optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classes MultiSelect */}
          <div className="space-y-2">
            <Label>Classes</Label>
            <MultiSelect
              options={classes.map((c) => ({
                value: c._id,
                label: `${c.name} (${c.academicYear})`,
              }))}
              value={watch("classes") || []}
              onChange={(v) => setValue("classes", v, { shouldValidate: true })}
              placeholder="Select Classes"
            />
          </div>

          {/* Teachers MultiSelect */}
          <div className="space-y-2">
            <Label>Teachers</Label>
            <MultiSelect
              options={teachers.map((t) => ({
                value: t._id,
                label: `${t.name}`,
              }))}
              value={watch("teachers") || []}
              onChange={(v) =>
                setValue("teachers", v, { shouldValidate: true })
              }
              placeholder="Select Teachers"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedSubject ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
