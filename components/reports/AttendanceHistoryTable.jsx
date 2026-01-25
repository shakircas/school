"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export default function AttendanceHistoryTable({ history }) {
  // If no history (meaning student was present every single day)
  if (!history || history.length === 0) {
    return (
      <div className="p-10 text-center bg-emerald-50/50 border-2 border-dashed border-emerald-100 rounded-2xl">
        <div className="flex justify-center mb-2">
          <div className="bg-emerald-100 p-2 rounded-full">
            <Info className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <h4 className="text-emerald-900 font-bold uppercase text-xs tracking-widest">
          Perfect Attendance
        </h4>
        <p className="text-emerald-600/80 text-sm mt-1">
          No absences, leaves, or late marks recorded for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden print:border-slate-200">
      <Table>
        <TableHeader className="bg-slate-50 print:bg-slate-100">
          <TableRow>
            <TableHead className="font-bold text-slate-700 uppercase text-[10px] tracking-wider py-4">
              Date
            </TableHead>
            <TableHead className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              Status
            </TableHead>
            <TableHead className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              Teacher Remarks
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry, index) => (
            <TableRow
              key={index}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="font-bold text-slate-700 py-4">
                {new Date(entry.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`
                    px-3 py-0.5 rounded-full text-[10px] font-black uppercase
                    ${entry.status === "Absent" ? "border-rose-200 bg-rose-50 text-rose-700" : ""}
                    ${entry.status === "Leave" ? "border-amber-200 bg-amber-50 text-amber-700" : ""}
                    ${entry.status === "Late" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                    ${entry.status === "Half Day" ? "border-purple-200 bg-purple-50 text-purple-700" : ""}
                  `}
                >
                  {entry.status}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 italic text-sm">
                {entry.remarks || (
                  <span className="text-slate-300 not-italic">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-3 bg-slate-50 border-t text-[9px] text-slate-400 font-medium text-center uppercase tracking-widest">
        End of exception log
      </div>
    </div>
  );
}
