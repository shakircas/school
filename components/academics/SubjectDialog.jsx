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
  { value: "urdu", label: "Urdu" },
  { value: "english", label: "English" },
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "islamiyat", label: "Islamiyat" },
  { value: "pak_studies", label: "Pakistan Studies" },
  { value: "drawing", label: "Drawing" },
  { value: "computer_science", label: "Computer Science" },
  { value: "geography", label: "Geography" },
  { value: "history", label: "History" },
];

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
    if (selectedSubject) {
      setValue("name", selectedSubject.name || "");
      setValue("code", selectedSubject.code || "");
      setValue("type", selectedSubject.type || "Compulsory");
      setValue("classes", selectedSubject.classes?.map((c) => c._id) || []);
      setValue("teachers", selectedSubject.teachers?.map((t) => t._id) || []);
    }
  }, [selectedSubject, setValue]);
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
              onValueChange={(value) => setValue("name", value)}
              defaultValue={selectedSubject?.name || ""}
              value={watch("name")}
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
            <Input {...register("code")} placeholder="e.g. MATH-101" />
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
