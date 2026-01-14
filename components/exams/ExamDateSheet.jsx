"use client";

import { Calendar, Download, Printer } from "lucide-react";
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
import { DateSheetRow } from "./DateSheetRow";

export function ExamDateSheet({ exam }) {
  // Helper to format day and date
  const formatDate = (dateStr) => {
    if (!dateStr) return { date: "-", day: "-" };
    const dateObj = new Date(dateStr);
    return {
      date: dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      day: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          Examination Schedule
        </h3>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Date Sheet
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm print:shadow-none print:border-none">
        {/* School Header for Print Only */}
        <div className="hidden print:block text-center p-6 border-b mb-4">
          <h1 className="text-2xl font-bold uppercase">
            Global Academy International
          </h1>
          <h2 className="text-xl font-semibold text-gray-600">
            {exam?.name} - {exam?.academicYear}
          </h2>
          <p className="text-sm">
            Class: {exam?.classId?.name} | Section: {exam?.sectionId}
          </p>
        </div>

        <Table>
          <TableHeader className="bg-slate-50 print:bg-slate-100">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              {/* <TableHead className="w-[120px]">Day</TableHead> */}
              <TableHead>Subject</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invigilator</TableHead>
              <TableHead className="text-right">Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {exam?.schedule?.length > 0 ? (
              exam?.schedule.map((item, idx) => {
                const { date, day } = formatDate(item.date);
                return (
                  <TableRow key={idx} className="print:break-inside-avoid">
                    <TableCell className="font-medium">{date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 print:bg-transparent print:text-black print:p-0 print:border-none"
                      >
                        {day}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {item.subject}
                    </TableCell>
                    <TableCell>
                      {item.startTime} — {item.endTime}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {item.invigilator?.name || "TBA"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {item.totalMarks} / {item.passingMarks}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No exams have been scheduled yet.
                </TableCell>
              </TableRow>
            )} */}

            {exam?.schedule?.length > 0 && exam?.schedule?.map((item, idx) => (
              <DateSheetRow key={idx} item={item} />
            ))}
          </TableBody>
        </Table>

        {/* Footer for Print Only */}
        <div className="hidden print:flex justify-between mt-12 px-6 pb-6 italic text-sm">
          <p>Note: Please reach the examination hall 15 minutes early.</p>
          <p>Controller of Examinations</p>
        </div>
      </div>
    </div>
  );
}
