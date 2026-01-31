"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  FileSpreadsheet,
  ClipboardCheck,
  AlertCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function ResultEntryBoard() {
  const [selectedClass, setSelectedClass] = useState("");
  const [examType, setExamType] = useState("mid-term");

  // Mock student list for the selected class
  const students = [
    { id: "101", name: "Ahmed Ali", rollNo: "001", marks: "" },
    { id: "102", name: "Sara Khan", rollNo: "002", marks: "" },
    { id: "103", name: "Zainab Bibi", rollNo: "003", marks: "" },
    { id: "104", name: "Muhammad Usman", rollNo: "004", marks: "" },
  ];

  const handleSave = () => {
    toast.success("Results updated successfully!", {
      description: `Marks for Class ${selectedClass} - ${examType} have been synced.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Selection Header */}
      <Card className="border-none shadow-sm bg-slate-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Academic Class
              </label>
              <Select onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {["6", "7", "8", "9", "10"].map((c) => (
                    <SelectItem key={c} value={c}>
                      Grade {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Subject
              </label>
              <Select defaultValue="math">
                <SelectTrigger className="bg-white rounded-xl border-slate-200">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="eng">English</SelectItem>
                  <SelectItem value="sci">General Science</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Exam Category
              </label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="bg-white rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mid-term">Mid-Term Examination</SelectItem>
                  <SelectItem value="final">
                    Final Annual Examination
                  </SelectItem>
                  <SelectItem value="monthly">Monthly Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-slate-900 rounded-xl gap-2 font-bold h-10 shadow-lg shadow-slate-200">
              <Search size={16} /> Fetch Student List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entry Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black">
              Score Entry Sheet
            </CardTitle>
            <CardDescription>Enter marks obtained out of 100</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2 border-slate-200"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export
              CSV
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="rounded-lg gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Save size={14} /> Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Roll No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-40">
                    Obtained Marks
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-400">
                      #{student.rollNo}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">
                        {student.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        placeholder="00"
                        className="h-9 rounded-lg border-slate-200 focus:ring-emerald-500"
                        max="100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50"
                      >
                        Pending
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        placeholder="Add note..."
                        className="h-9 border-none bg-transparent focus:bg-white text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs">
        <AlertCircle size={14} />
        <p className="font-medium">
          Note: Marks exceeding 100 will be flagged by the system. Grade
          calculations are performed automatically upon saving.
        </p>
      </div>
    </div>
  );
}
