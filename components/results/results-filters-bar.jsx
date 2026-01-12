"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Filter } from "lucide-react";

export function ResultsFiltersBar({ exams, classes, filters, setFilters }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {/* Exam */}
      <Select
        value={filters.examId}
        onValueChange={(v) => setFilters((p) => ({ ...p, examId: v }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Exam" />
        </SelectTrigger>
        <SelectContent>
          {exams.map((e) => (
            <SelectItem key={e._id} value={e._id}>
              {e.name} • {e.examType} • {e.academicYear} • {e.classId.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Class */}
      <Select
        value={filters.classId}
        onValueChange={(v) => setFilters((p) => ({ ...p, classId: v }))}
      >
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

      {/* Section */}
      <Input
        placeholder="Section (A, B...)"
        value={filters.sectionId}
        onChange={(e) =>
          setFilters((p) => ({
            ...p,
            sectionId: e.target.value,
          }))
        }
      />

      {/* Student search */}
      <Input
        placeholder="Student / Roll"
        value={filters.student}
        onChange={(e) =>
          setFilters((p) => ({
            ...p,
            student: e.target.value,
          }))
        }
      />

      {/* Reset */}
      <Button
        variant="outline"
        onClick={() =>
          setFilters({
            examId: "",
            classId: "",
            sectionId: "",
            student: "",
          })
        }
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
