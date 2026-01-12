"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function ResultSubjectsDialog({ open, onOpenChange, result }) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{result.student?.name} — Subject Marks</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {result.subjects.map((s, i) => {
            const percent = (s.obtainedMarks / s.totalMarks) * 100;
            return (
              <div
                key={i}
                className="flex justify-between items-center border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.obtainedMarks} / {s.totalMarks}
                  </p>
                </div>
                <Badge variant="secondary">{percent.toFixed(1)}%</Badge>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
