"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react"; // Import QR library
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, GraduationCap, ShieldCheck, Download } from "lucide-react";

export function ResultSubjectsDialog({ open, onOpenChange, result }) {
  const componentRef = useRef();

  // Generate a verification URL (Point this to your public results page)
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/result/${result?._id}`
      : "";

  const handlePrint = () => {
    window.print();
  };

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-h-[95vh]  bg-slate-100 p-0 border-none flex flex-col top-[50%] translate-y-[-50%]">
        {/* Actions Bar - Hidden on Print */}
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between sticky top-0 z-20 print:hidden">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Certificate Preview
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-indigo-600">
              <Printer className="h-4 w-4" /> Print Document
            </Button>
          </div>
        </DialogHeader>

        {/* --- PRINTABLE A4 PAGE --- */}
        <div
          ref={componentRef}
          className="print-container bg-white mx-auto my-8 print:m-0 shadow-2xl print:shadow-none"
          style={{
            width: "210mm",
            height: "297mm",
            padding: "15mm",
            position: "relative",
            backgroundColor: "#fff",
            color: "#000",
          }}
        >
          {/* Border Frame */}
          <div className="absolute inset-4 border-[1px] border-slate-300 pointer-events-none" />
          <div className="absolute inset-6 border-[3px] border-double border-slate-800 pointer-events-none" />

          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-8 relative">
            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
              <GraduationCap size={48} className="text-slate-800" />
            </div>

            <div className="text-center flex-1 px-4">
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none mb-2">
                Modern Academy of Excellence
              </h1>
              <p className="text-xs font-bold text-slate-600 tracking-[0.2em] uppercase mb-1">
                Affiliated with National Education Board
              </p>
              <p className="text-sm font-black bg-slate-900 text-white inline-block px-4 py-1 rounded">
                TRANSCRIPT OF ACADEMIC RECORD
              </p>
            </div>

            <div className="w-24 h-24 border-2 border-slate-200 p-1 rounded-md">
              {/* QR Code for Verification */}
              <QRCodeSVG value={verificationUrl} size={88} level="H" />
            </div>
          </div>

          {/* STUDENT DATA TABLE */}
          <div className="mb-6">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-32 uppercase text-[10px]">
                    Student Name
                  </td>
                  <td className="border border-slate-300 p-2 font-black uppercase">
                    {result.student?.name}
                  </td>
                  <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-32 uppercase text-[10px]">
                    Roll Number
                  </td>
                  <td className="border border-slate-300 p-2 font-mono font-bold uppercase">
                    {result.student?._id?.slice(-8)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold bg-slate-50 uppercase text-[10px]">
                    Class/Grade
                  </td>
                  <td className="border border-slate-300 p-2 font-bold">
                    {result.classId?.name}
                  </td>
                  <td className="border border-slate-300 p-2 font-bold bg-slate-50 uppercase text-[10px]">
                    Academic Year
                  </td>
                  <td className="border border-slate-300 p-2 font-bold">
                    {result.academicYear}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MARKS TABLE */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-slate-100 border-2 border-slate-900">
                <th className="p-3 text-left border border-slate-900 uppercase text-xs">
                  Subject Name
                </th>
                <th className="p-3 text-center border border-slate-900 uppercase text-xs w-24">
                  Max Marks
                </th>
                <th className="p-3 text-center border border-slate-900 uppercase text-xs w-24">
                  Min Marks
                </th>
                <th className="p-3 text-center border border-slate-900 uppercase text-xs w-24">
                  Obtained
                </th>
                <th className="p-3 text-center border border-slate-900 uppercase text-xs w-32">
                  Grade/Result
                </th>
              </tr>
            </thead>
            <tbody>
              {result.subjects?.map((s, i) => (
                <tr key={i} className="border-b border-slate-300 h-10">
                  <td className="px-3 border-x border-slate-900 font-bold uppercase text-xs">
                    {s.subject}
                  </td>
                  <td className="px-3 border-x border-slate-900 text-center font-bold">
                    {s.totalMarks}
                  </td>
                  <td className="px-3 border-x border-slate-900 text-center text-slate-600">
                    {s.passingMarks}
                  </td>
                  <td className="px-3 border-x border-slate-900 text-center font-black text-lg">
                    {s.obtainedMarks}
                  </td>
                  <td
                    className={`px-3 border-x border-slate-900 text-center font-black text-xs uppercase ${
                      s.obtainedMarks < s.passingMarks
                        ? "text-red-600"
                        : "text-slate-800"
                    }`}
                  >
                    {s.obtainedMarks >= s.passingMarks ? "PASSED" : "FAILED"}
                  </td>
                </tr>
              ))}
              {/* Padding Rows to keep height consistent */}
              {[...Array(Math.max(0, 8 - (result.subjects?.length || 0)))].map(
                (_, i) => (
                  <tr
                    key={`blank-${i}`}
                    className="border-b border-slate-200 h-10"
                  >
                    <td className="border-x border-slate-900" />
                    <td className="border-x border-slate-900" />
                    <td className="border-x border-slate-900" />
                    <td className="border-x border-slate-900" />
                    <td className="border-x border-slate-900" />
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-2 border-slate-900">
                <td className="p-3 font-black uppercase text-xs">
                  Aggregate Results
                </td>
                <td className="p-3 text-center font-black">
                  {result.totalMaxMarks}
                </td>
                <td className="p-3 text-center" />
                <td className="p-3 text-center font-black bg-slate-200">
                  {result.totalObtainedMarks}
                </td>
                <td className="p-3 text-center font-black">{result.status}</td>
              </tr>
            </tfoot>
          </table>

          {/* PERFORMANCE SUMMARY */}
          <div className="flex gap-4 mb-10">
            <div className="flex-1 border-2 border-slate-900 p-4 text-center">
              <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Percentage
              </span>
              <span className="text-2xl font-black">
                {result.percentage?.toFixed(2)}%
              </span>
            </div>
            <div className="flex-1 border-2 border-slate-900 p-4 text-center">
              <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Letter Grade
              </span>
              <span className="text-2xl font-black">{result.grade || "A"}</span>
            </div>
            <div className="flex-1 border-2 border-slate-900 p-4 text-center">
              <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Attendance
              </span>
              <span className="text-2xl font-black">
                {result.attendancePercentage || 100}%
              </span>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="mt-16 flex justify-between items-end">
            <div className="text-center">
              <div className="w-48 border-t-2 border-slate-900 pt-2">
                <p className="text-[10px] font-black uppercase">
                  Examination In-Charge
                </p>
              </div>
            </div>

            <div className="text-center opacity-30 flex flex-col items-center">
              <ShieldCheck size={40} />
              <p className="text-[8px] font-bold mt-1 uppercase tracking-widest">
                Official Seal
              </p>
            </div>

            <div className="text-center">
              <div className="w-48 border-t-2 border-slate-900 pt-2">
                <p className="text-[10px] font-black uppercase">
                  Headmaster / Principal
                </p>
              </div>
            </div>
          </div>

          {/* VERIFICATION FOOTER */}
          <div className="absolute bottom-12 left-10 right-10 flex items-center gap-4 pt-4 border-t border-slate-200">
            <p className="text-[8px] font-medium text-slate-500 leading-tight">
              Verification: This academic record can be verified by scanning the
              QR code on the top right or by visiting the official school
              portal. Any unauthorized alteration to this document is a
              punishable offense. Generated on:{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* --- PRINT CSS --- */}
        <style jsx global>{`
          @media print {
            body {
              background: none !important;
              margin: 0;
              padding: 0;
            }
            .print-container {
              margin: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              padding: 10mm !important;
            }
            @page {
              size: A4;
              margin: 0;
            }
            .print-hidden {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
