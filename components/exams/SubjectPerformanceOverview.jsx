"use client";

import React, { useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Trophy,
  Search,
  LayoutGrid,
  List,
  Printer,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SubjectPerformanceOverview({ results }) {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Data Aggregation Logic
  const subjectStats = useMemo(() => {
    const stats = {};
    results.forEach((studentResult) => {
      studentResult.subjects?.forEach((s) => {
        const name = s.subject;
        if (!stats[name]) {
          stats[name] = {
            name,
            totalStudents: 0,
            passed: 0,
            totalObtained: 0,
            totalPossible: 0,
            topScore: -1,
            topStudent: "",
          };
        }
        const st = stats[name];
        st.totalStudents += 1;
        st.totalObtained += s.obtainedMarks || 0;
        st.totalPossible += s.totalMarks || 100;
        if ((s.obtainedMarks || 0) > st.topScore) {
          st.topScore = s.obtainedMarks;
          st.topStudent = studentResult.student?.name || "N/A";
        }
        if ((s.obtainedMarks || 0) >= (s.passingMarks || 33)) st.passed += 1;
      });
    });

    return Object.values(stats)
      .map((s) => ({
        ...s,
        passPercentage: (s.passed / s.totalStudents) * 100,
        averageScore:
          s.totalPossible > 0 ? (s.totalObtained / s.totalPossible) * 100 : 0,
      }))
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [results, searchTerm]);

  // 2. Print Handler
  const handlePrint = () => {
    window.print();
  };

  if (!results?.length) return null;

  return (
    <div className="space-y-6">
      {/* 3. Dashboard Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm print:hidden">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Subject-Wise Analytics
          </h3>
          <p className="text-sm text-slate-500">
            Administrative oversight for principal review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search subject..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="print:hidden mb-4">
          <TabsTrigger value="cards">
            <LayoutGrid className="h-4 w-4 mr-2" /> Gallery
          </TabsTrigger>
          <TabsTrigger value="table">
            <List className="h-4 w-4 mr-2" /> Audit Table
          </TabsTrigger>
        </TabsList>

        {/* 4. The Printable Area - Added 'print-area' class for CSS targeting */}
        <div className="print-area">
          {/* Print-Only Header */}
          <div className="hidden print:block text-center mb-8 border-b-2 pb-4">
            <h1 className="text-2xl font-black uppercase">
              Official Subject Performance Report
            </h1>
            <p className="text-sm">
              Academic Year: 2025-26 | Generated on:{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>

          <TabsContent value="table" className="m-0">
            <Card className="print:border-none print:shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 print:bg-slate-100">
                    <TableRow>
                      <TableHead className="font-bold print:text-black">
                        Subject
                      </TableHead>
                      <TableHead className="text-center font-bold print:text-black">
                        Students
                      </TableHead>
                      <TableHead className="text-center font-bold print:text-black">
                        Pass %
                      </TableHead>
                      <TableHead className="text-center font-bold print:text-black">
                        Avg %
                      </TableHead>
                      <TableHead className="font-bold print:text-black">
                        Champion Performer
                      </TableHead>
                      <TableHead className="text-right font-bold print:text-black">
                        Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectStats.map((subject) => (
                      <TableRow
                        key={subject.name}
                        className="print:border-b print:border-slate-300"
                      >
                        <TableCell className="font-bold text-slate-700">
                          {subject.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.totalStudents}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {subject.passPercentage.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-600">
                          {subject.averageScore.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-3 w-3 text-amber-500 print:hidden" />
                            <span className="text-sm">
                              {subject.topStudent}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {subject.topScore}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Print-Only Footer for Signatures */}
                <div className="hidden print:grid grid-cols-2 gap-20 mt-20 px-10">
                  <div className="border-t border-black text-center pt-2 text-sm font-bold">
                    Class Teacher Signature
                  </div>
                  <div className="border-t border-black text-center pt-2 text-sm font-bold">
                    Principal's Signature & Seal
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="print:hidden">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subjectStats.map((subject) => {
                const isStruggling = subject.passPercentage < 60;
                return (
                  <Card
                    key={subject.name}
                    className="relative overflow-hidden shadow-md border-t-4"
                    style={{
                      borderTopColor: isStruggling ? "#ef4444" : "#6366f1",
                    }}
                  >
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className="mb-2 font-bold uppercase text-[10px] tracking-wider"
                        >
                          Academic Report
                        </Badge>
                        {isStruggling && (
                          <span className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
                            <AlertCircle className="h-3 w-3" /> CRITICAL
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl font-black uppercase text-slate-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        {subject.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase leading-none mb-1">
                            Top Performer
                          </p>
                          <p className="text-sm font-black text-slate-700 truncate">
                            {subject.topStudent}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-indigo-600 leading-none">
                            {subject.topScore}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            Pass Rate
                          </p>
                          <p
                            className={`text-lg font-black ${isStruggling ? "text-red-600" : "text-slate-800"}`}
                          >
                            {subject.passPercentage.toFixed(0)}%
                          </p>
                          <Progress
                            value={subject.passPercentage}
                            className="h-1.5"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            Class Avg
                          </p>
                          <p className="text-lg font-black text-slate-800">
                            {subject.averageScore.toFixed(0)}%
                          </p>
                          <Progress
                            value={subject.averageScore}
                            className="h-1.5"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t flex justify-between items-center text-muted-foreground">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
                          <Users className="h-3 w-3" /> {subject.totalStudents}{" "}
                          Students
                        </div>
                        <div className="text-[10px] font-bold uppercase">
                          Batch: 2024-25
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
