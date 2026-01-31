"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Download,
  FileText,
  ChevronRight,
  Library,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const SYLLABUS_DATA = {
  6: [
    {
      subject: "Mathematics",
      topics: "Algebra, Geometry, Fractions",
      file: "/syllabus/math6.pdf",
    },
    {
      subject: "General Science",
      topics: "Plants, Matter, Energy",
      file: "/syllabus/sci6.pdf",
    },
    {
      subject: "English",
      topics: "Grammar, Composition, Literature",
      file: "/syllabus/eng6.pdf",
    },
  ],
  9: [
    {
      subject: "Physics",
      topics: "Kinematics, Dynamics, Work & Energy",
      file: "/syllabus/phy9.pdf",
    },
    {
      subject: "Chemistry",
      topics: "Atomic Structure, Periodicity",
      file: "/syllabus/chem9.pdf",
    },
    {
      subject: "Computer Science",
      topics: "Programming, Data Types",
      file: "/syllabus/cs9.pdf",
    },
  ],
  // Add 7, 8, and 10 similarly
};

export default function SyllabusModal({ trigger }) {
  const [activeGrade, setActiveGrade] = useState("9");

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Library size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <BookOpen size={28} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">
                Academic Syllabus
              </DialogTitle>
              <p className="text-slate-400 text-sm">
                Download updated curriculum for Session 2026
              </p>
            </div>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="px-8 py-4 border-b bg-slate-50/50">
          <Tabs
            defaultValue="9"
            onValueChange={setActiveGrade}
            className="w-full"
          >
            <TabsList className="bg-white border p-1 h-12 rounded-xl flex justify-between">
              {["6", "7", "8", "9", "10"].map((grade) => (
                <TabsTrigger
                  key={grade}
                  value={grade}
                  className="flex-1 rounded-lg font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
                >
                  Grade {grade}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Subjects List */}
        <ScrollArea className="flex-1 p-8">
          <div className="grid gap-4">
            {SYLLABUS_DATA[activeGrade]?.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.topics}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-emerald-600 text-white gap-2 rounded-xl transition-all"
                  onClick={() => window.open(item.file, "_blank")}
                >
                  <Download size={14} /> Download
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium italic">
            * Syllabus is approved by the Academic Board.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 font-bold hover:bg-emerald-50"
          >
            Request Print Copy <ChevronRight size={14} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
