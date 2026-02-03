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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ResultDMCDialog } from "./ResultDMCDialog";
import { getGradeBadge, getGradeColor } from "@/lib/constants";

export function ResultsTable({ results, onEdit, onDelete }) {
  const [activeResult, setActiveResult] = useState(null);
  const [isDmcOpen, setIsDmcOpen] = useState(false);

  // Helper to calculate totals directly from the subjects array
  const calculateStats = (subjects = []) => {
    const totalObtained = subjects.reduce(
      (acc, s) => acc + (s.obtainedMarks || 0),
      0,
    );
    const totalMax = subjects.reduce((acc, s) => acc + (s.totalMarks || 0), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    return { totalObtained, totalMax, percentage };
  };

  

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <h1 className="md:hidden print:block">Resut</h1>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="font-semibold">Student & Roll</TableHead>
            <TableHead className="font-semibold">Class/Sec</TableHead>
            <TableHead className="font-semibold text-center">
              Marks (Obt/Total)
            </TableHead>
            <TableHead className="font-semibold text-center">
              Percentage
            </TableHead>
            <TableHead className="font-semibold text-center">Grade</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right no-print">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r, i) => {
            // Calculate fresh stats for every row
            const stats = calculateStats(r.subjects);

            return (
              <TableRow
                key={r._id}
                className="hover:bg-slate-50/30 transition-colors"
              >
                <TableCell className="text-slate-500 font-mono text-xs">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">
                      {r.student?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase">
                      Roll: {r.student?.rollNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-white font-medium uppercase text-[10px]"
                  >
                    {r.classId?.name} - {r.sectionId}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium">
                  <span className="text-indigo-600 font-bold">
                    {stats.totalObtained}
                  </span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-slate-600">{stats.totalMax}</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black text-slate-700 text-sm">
                      {stats.percentage.toFixed(1)}%
                    </span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${r.status === "Pass" ? "bg-indigo-500" : "bg-red-400"}`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`${getGradeColor(stats.percentage)} font-bold shadow-sm`}
                  >
                    {getGradeBadge(stats.percentage) || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div
                    className={`flex items-center gap-1.5 font-bold text-xs uppercase ${r.status === "Pass" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${r.status === "Pass" ? "bg-emerald-600" : "bg-red-600 animate-pulse"}`}
                    />
                    {r.status}
                  </div>
                </TableCell>
                <TableCell className="text-right no-print">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        setActiveResult(r);
                        setIsDmcOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                      onClick={() => onEdit(r)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(r._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ResultDMCDialog
        open={isDmcOpen}
        onOpenChange={setIsDmcOpen}
        result={activeResult}
      />
    </div>
  );
}
