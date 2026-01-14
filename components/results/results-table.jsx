"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ResultSubjectsDialog } from "./result-subjects-dialog";

export function ResultsTable({ results, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

   console.log("form table", results);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((r, i) => (
            <TableRow key={r._id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell className="font-medium">{r.student?.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {r.classId?.name} - {r.sectionId}
                </Badge>
              </TableCell>
              <TableCell>{r.exam?.name}</TableCell>
              <TableCell>{r.percentage?.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge>{r.grade}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    r.status === "Pass"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }
                >
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setActiveResult(r);
                    setOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button size="icon" variant="outline" onClick={() => onEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDelete(r._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResultSubjectsDialog
        open={open}
        onOpenChange={setOpen}
        result={activeResult}
      />
    </>
  );
}
