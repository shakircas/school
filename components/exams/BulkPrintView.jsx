"use client";

import { Printer, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { StudentResultCard } from "./student-result-card";
import { useRouter } from "next/navigation";
import { StudentResultCard } from "./StudentResultCard";

export default function BulkPrintView({ results = [] }) {
  const router = useRouter();

  const exportToCSV = () => {
    if (!results.length) return;

    // 1. Define Headers (Basic Info + Subjects)
    const subjectNames = results[0].subjects.map((s) => s.subject);
    const headers = [
      "Roll No",
      "Student Name",
      "Father Name",
      ...subjectNames,
      "Total",
      "Percentage",
      "Grade",
    ];

    // 2. Map Data rows
    const rows = results.map((res) => {
      const obtained = res.subjects.reduce(
        (sum, s) => sum + s.obtainedMarks,
        0,
      );
      const total = res.subjects.reduce((sum, s) => sum + s.totalMarks, 0);
      const percentage = ((obtained / total) * 100).toFixed(2);

      // Get marks for each subject in order
      const subjectMarks = res.subjects.map((s) => s.obtainedMarks);

      return [
        res.student?.rollNumber,
        res.student?.name,
        res.student?.fatherName,
        ...subjectMarks,
        obtained,
        `${percentage}%`,
        "A", // You can call your calculateGrade function here
      ];
    });

    // 3. Build CSV String
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Results_Export_${new Date().toLocaleDateString()}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 bg-white border-b p-4 mb-6 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-lg font-black uppercase tracking-tighter">
              Export Station
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
            </Button>

            <Button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-black px-8"
            >
              <Printer className="w-4 h-4 mr-2" /> Print (2 Per A4)
            </Button>
          </div>
        </div>
      </div>

      {/* CARDS CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 print:max-w-none print:p-0">
        {results.map((res, index) => (
          <div key={res._id || index}>
            <StudentResultCard result={res} />
            {(index + 1) % 2 === 0 && (
              <div className="hidden print:block h-0 page-break-separator" />
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background-color: white !important;
          }
          .page-break-separator {
            page-break-after: always;
            break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
