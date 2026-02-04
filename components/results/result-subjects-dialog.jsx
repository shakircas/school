"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer,
  GraduationCap,
  ShieldCheck,
  Download,
  Loader2,
} from "lucide-react";

export function ResultSubjectsDialog({ open, onOpenChange, result }) {
  const componentRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/result/${result?._id}`
      : "";

  // PDF GENERATION LOGIC
  const generatePDF = async () => {
    if (!componentRef.current) return;
    setIsDownloading(true);

    const el = componentRef.current;
    el.classList.add("pdf-safe");

    try {
      const canvas = await html2canvas(el, {
        scale: 2, // 3 is overkill and causes memory issues
        useCORS: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, imgHeight);
      pdf.save(`${result.student?.name}_Result.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
    } finally {
      el.classList.remove("pdf-safe");
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print-target w-full max-w-[950px] max-h-[95vh] overflow-y-auto bg-slate-100 p-0 border-none flex flex-col top-[50%] translate-y-[-50%]">
        {/* Actions Bar */}
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between sticky top-0 z-50 print:hidden">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Certificate Preview
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>

            {/* NEW DOWNLOAD BUTTON */}
            <Button
              variant="secondary"
              onClick={generatePDF}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Save PDF
            </Button>

            <Button onClick={handlePrint} className="gap-2 bg-indigo-600">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </DialogHeader>

        {/* --- PRINTABLE A4 PAGE --- */}
        <div className="flex-1 overflow-y-auto print:overflow-visible p-0 sm:p-8 bg-slate-200 print:bg-white flex justify-center">
          <div
            ref={componentRef}
            className="print-container bg-white shadow-2xl print:shadow-none print:m-0"
            style={{
              width: "210mm",
              height: "297mm", // Fixed height for perfect A4
              padding: "15mm",
              position: "relative",
              backgroundColor: "#fff",
              color: "#000",
              boxSizing: "border-box", // Essential for padding math
            }}
          >
            {/* All your existing certificate layout code stays exactly the same here */}
            {/* [Existing Frame, Header, Table, Footer logic...] */}
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
                    Max
                  </th>
                  <th className="p-3 text-center border border-slate-900 uppercase text-xs w-24">
                    Min
                  </th>
                  <th className="p-3 text-center border border-slate-900 uppercase text-xs w-24">
                    Obtained
                  </th>
                  <th className="p-3 text-center border border-slate-900 uppercase text-xs w-32">
                    Status
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
                      className={`px-3 border-x border-slate-900 text-center font-black text-xs uppercase ${s.obtainedMarks < s.passingMarks ? "text-red-600" : "text-slate-800"}`}
                    >
                      {s.obtainedMarks >= s.passingMarks ? "PASSED" : "FAILED"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-2 border-slate-900">
                  <td className="p-3 font-black uppercase text-xs">
                    Aggregate Results
                  </td>
                  <td className="p-3 text-center font-black">
                    {result?.subjects?.reduce(
                      (acc, s) => acc + (s.totalMarks || 0),
                      0,
                    )}
                  </td>
                  <td className="p-3 text-center" />
                  <td className="p-3 text-center font-black bg-slate-200">
                    {result?.subjects?.reduce(
                      (acc, s) => acc + (s.obtainedMarks || 0),
                      0,
                    )}
                  </td>
                  <td className="p-3 text-center font-black">
                    {result.status}
                  </td>
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
                  {(() => {
                    const obtained = result?.subjects?.reduce(
                      (acc, s) => acc + (s.obtainedMarks || 0),
                      0,
                    );
                    const max = result?.subjects?.reduce(
                      (acc, s) => acc + (s.totalMarks || 0),
                      0,
                    );
                    return max > 0
                      ? ((obtained / max) * 100).toFixed(1)
                      : "0.0";
                  })()}
                  %
                </span>
              </div>
              <div className="flex-1 border-2 border-slate-900 p-4 text-center">
                <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Grade
                </span>
                <span className="text-2xl font-black">
                  {result.grade || "A"}
                </span>
              </div>
            </div>

            {/* SIGNATURES */}
            <div className="mt-16 flex justify-between items-end px-4">
              <div className="text-center border-t-2 border-slate-900 w-48 pt-2">
                <p className="text-[10px] font-black uppercase">
                  Examination In-Charge
                </p>
              </div>
              <div className="text-center border-t-2 border-slate-900 w-48 pt-2">
                <p className="text-[10px] font-black uppercase">
                  Headmaster / Principal
                </p>
              </div>
            </div>

            {/* VERIFICATION FOOTER */}
            <div className="absolute bottom-10 left-10 right-10 flex items-center gap-4 pt-4 border-t border-slate-200">
              <p className="text-[8px] font-medium text-slate-500 leading-tight">
                Verification: This academic record can be verified by scanning
                the QR code or visiting the school portal. Generated:{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* --- PERFECTED PRINT CSS --- */}
        <style jsx global>{`
          @media print {
            /* 1. Reset page defaults */
            @page {
              size: A4 portrait;
              margin: 0;
            }

            /* 2. Force colors and backgrounds (Modern Browsers) */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* 3. Hide everything except the dialog content */
            body > *:not(.print-target),
            header,
            nav,
            button {
              display: none !important;
            }

            /* 4. Fix the container to the top-left */
            .print-target {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            /* 5. Ensure the container fills the A4 sheet exactly */
            .print-container {
              width: 210mm !important;
              height: 297mm !important;
              padding: 15mm !important;
              border: none !important;
              box-shadow: none !important;
              display: block !important;
            }

            /* 6. Fix for text rendering */
            body {
              -webkit-font-smoothing: antialiased;
              background: white !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
