"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FileIcon,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function SubmissionsView({ assignment, isOpen, onClose, onUpdate }) {
  const [gradingStudent, setGradingStudent] = useState(null);
  const [filterText, setFilterText] = useState("");

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const gradeData = {
      marks: formData.get("marks"),
      feedback: formData.get("feedback"),
      status: "Graded",
      gradedAt: new Date(),
    };

    try {
      // API call to update the specific submission within the assignment
      const res = await fetch(
        `/api/assignments/${assignment._id}/submissions/${gradingStudent.student}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gradeData),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(`Graded ${gradingStudent.studentName}`);
      setGradingStudent(null);
      onUpdate(); // Refresh parent data
    } catch (error) {
      toast.error("Failed to save grade");
    }
  };

  const filteredSubmissions =
    assignment?.submissions?.filter(
      (s) =>
        s.studentName.toLowerCase().includes(filterText.toLowerCase()) ||
        s.rollNumber.includes(filterText)
    ) || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-4xl w-full p-0 flex flex-col"
      >
        <div className="p-6 bg-slate-900 text-white">
          <SheetHeader>
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-2xl font-bold text-white">
                  {assignment?.title}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  {assignment?.class} • {assignment?.subject} •{" "}
                  {assignment?.totalMarks} Max Marks
                </SheetDescription>
              </div>
              <Badge className="bg-indigo-600 border-none px-3 py-1">
                {assignment?.submissions?.length || 0} Submissions
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <div className="p-4 border-b flex gap-4 bg-slate-50 dark:bg-slate-900">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student or roll number..."
              className="pl-9 bg-white"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead className="font-bold">Student</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Submitted</TableHead>
                <TableHead className="font-bold">Files</TableHead>
                <TableHead className="font-bold text-right">Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((sub) => (
                <TableRow key={sub.student}>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {sub.studentName}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                      Roll: {sub.rollNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        sub.status === "Graded"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">
                    {sub.submittedAt
                      ? format(new Date(sub.submittedAt), "MMM d, HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {sub.attachments?.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          title={file.name}
                        >
                          <FileIcon className="h-5 w-5 text-indigo-500 hover:text-indigo-700 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-indigo-600">
                    {sub.marks ? `${sub.marks}/${assignment.totalMarks}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                      onClick={() => setGradingStudent(sub)}
                    >
                      {sub.status === "Graded" ? "Re-grade" : "Grade"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* GRADING MODAL (Nested) */}
        {gradingStudent && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200 z-50">
            <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white text-center">
                <h3 className="text-xl font-bold">
                  Grading {gradingStudent.studentName}
                </h3>
                <p className="text-indigo-100 text-sm">
                  Assignment: {assignment.title}
                </p>
              </div>
              <form onSubmit={handleGradeSubmit} className="p-8 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">
                    Awarded Marks (Max: {assignment.totalMarks})
                  </Label>
                  <Input
                    name="marks"
                    type="number"
                    max={assignment.totalMarks}
                    required
                    defaultValue={gradingStudent.marks}
                    className="h-12 text-lg font-bold text-center border-none bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">
                    Teacher Feedback
                  </Label>
                  <Textarea
                    name="feedback"
                    placeholder="Well done! Excellent research..."
                    defaultValue={gradingStudent.feedback}
                    className="resize-none bg-slate-50 border-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setGradingStudent(null)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-slate-900"
                  >
                    Save Grade
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
