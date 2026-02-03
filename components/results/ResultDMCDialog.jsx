import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGradeBadge } from "@/lib/constants";

export function ResultDMCDialog({ open, onOpenChange, result }) {
  if (!result) return null;

  // Recalculate totals from the subjects array
  const totalObtained = result.subjects?.reduce(
    (acc, sub) => acc + (sub.obtainedMarks || 0),
    0,
  );
  const totalMax = result.subjects?.reduce(
    (acc, sub) => acc + (sub.totalMarks || 0),
    0,
  );
  const percentage =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Max width set to 7xl for a much wider preview */}
      <DialogContent className="max-w-6xl w-[80vw] h-[95vh] p-0 flex flex-col border-none shadow-2xl">
        {/* INLINE CSS FOR PRINTING AND ORIENTATION */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @page {
              size: portrait;
              margin: 10mm;
            }
            @media print {
              body * { visibility: hidden; }
              #dmc-section, #dmc-section * { visibility: visible; }
              #dmc-section { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                padding: 0;
                margin: 0;
                border: none !important;
                box-shadow: none !important;
              }
              .no-print { display: none !important; }
            }
          `,
          }}
        />

        {/* DIALOG HEADER (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white no-print">
          <h2 className="font-bold uppercase tracking-widest text-sm">
            Full Detailed Report Preview
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-slate-800 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-6 md:p-10 custom-scrollbar">
          {/* THE ACTUAL PRINTABLE SHEET - Width adjusted for Portrait Paper ratio */}
          <div
            className="bg-white mx-auto shadow-2xl border border-slate-300 p-8 md:p-16 min-h-[1123px] w-full max-w-[850px]"
            id="dmc-section"
          >
            {/* SCHOOL BRANDING / HEADER */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-8">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
                Statement of Marks
              </h1>
              <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm mt-1">
                Academic Session {result.academicYear}
              </p>
            </div>

            {/* STUDENT PROFILE & PHOTO ROW */}
            <div className="flex gap-8 mb-10">
              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm flex-1">
                <div className="border-b border-slate-200 pb-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-black italic">
                    Student Name
                  </span>
                  <p className="font-bold text-xl text-slate-800">
                    {result.student?.name}
                  </p>
                </div>
                <div className="border-b border-slate-200 pb-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-black italic">
                    Roll Number
                  </span>
                  <p className="font-bold text-xl text-slate-800">
                    {result.student?.rollNumber}
                  </p>
                </div>
                <div className="border-b border-slate-200 pb-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-black italic">
                    Class & Section
                  </span>
                  <p className="font-semibold text-lg text-slate-700">
                    {result.classId?.name} ({result.sectionId})
                  </p>
                </div>
                <div className="border-b border-slate-200 pb-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-black italic">
                    Examination
                  </span>
                  <p className="font-semibold text-lg text-slate-700">
                    {result.exam?.name}
                  </p>
                </div>
              </div>

              {/* Photo Placeholder */}
              <div className="w-32 h-40 border-2 border-slate-200 rounded flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden shrink-0">
                {result.student?.image ? (
                  <img
                    src={result.student.image}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <User className="w-12 h-12 text-slate-200 mb-1" />
                    <span className="text-[8px] uppercase text-slate-300 font-bold">
                      Passport Photo
                    </span>
                  </>
                )}
                <div className="absolute inset-0 border-[10px] border-white/10 pointer-events-none"></div>
              </div>
            </div>

            {/* SUBJECTS TABLE */}
            <div className="border-2 border-slate-900 rounded-sm mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[12px] tracking-widest">
                    <th className="px-6 py-4 text-left">Subject Description</th>
                    <th className="px-4 py-4 text-center">Max</th>
                    <th className="px-4 py-4 text-center">Pass</th>
                    <th className="px-4 py-4 text-center">Obtained</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.subjects?.map((sub, idx) => (
                    <tr
                      key={idx}
                      className={
                        sub.obtainedMarks < sub.passingMarks
                          ? "bg-red-50/50"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {sub.subject}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {sub.totalMarks}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-400 font-mono">
                        {sub.passingMarks}
                      </td>
                      <td
                        className={`px-4 py-4 text-center font-black text-lg ${sub.obtainedMarks < sub.passingMarks ? "text-red-600" : "text-indigo-700"}`}
                      >
                        {sub.isAbsent ? "ABS" : sub.obtainedMarks}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-[11px] font-bold uppercase ${sub.obtainedMarks < sub.passingMarks ? "text-red-600" : "text-slate-500"}`}
                      >
                        {sub.obtainedMarks >= sub.passingMarks
                          ? "Passed"
                          : "Failed"}
                      </td>
                    </tr>
                  ))}
                  {/* GRAND TOTAL */}
                  <tr className="bg-slate-50 border-t-2 border-slate-900">
                    <td className="px-6 py-5 font-black text-slate-900 uppercase text-base">
                      Grand Total
                    </td>
                    <td className="px-4 py-5 text-center font-bold text-lg">
                      {totalMax}
                    </td>
                    <td className="px-4 py-5"></td>
                    <td className="px-4 py-5 text-center text-indigo-700 text-2xl font-black">
                      {totalObtained}
                    </td>
                    <td className="px-6 py-5 text-right text-2xl font-black text-slate-900">
                      {percentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOTTOM SUMMARY CARDS */}
            <div className="grid grid-cols-3 gap-6 mb-24">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
                <span className="text-[11px] text-slate-500 block uppercase font-bold mb-1">
                  Final Grade
                </span>
                <span className="text-3xl font-black text-slate-800">
                  {getGradeBadge(percentage)}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
                <span className="text-[11px] text-slate-500 block uppercase font-bold mb-1">
                  Attendance
                </span>
                <span className="text-3xl font-black text-slate-800">
                  {result.attendancePercentage || 0}%
                </span>
              </div>
              <div
                className={`p-4 rounded text-center border-2 ${result.status === "Pass" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                <span className="text-[11px] opacity-70 block uppercase font-bold mb-1">
                  Result Status
                </span>
                <span className="text-3xl font-black uppercase">
                  {result.status}
                </span>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="mt-auto flex justify-between items-end pt-12">
              <div className="text-center">
                <div className="w-48 border-b border-slate-300 mb-2" />
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-tighter">
                  Class Teacher Signature
                </span>
              </div>
              <div className="text-center">
                <p className="mb-2 text-sm font-serif italic text-slate-400 underline decoration-slate-200">
                  Authorized Official
                </p>
                <div className="w-60 border-b-2 border-slate-900 mb-2" />
                <span className="text-[11px] font-black uppercase text-slate-900 tracking-widest">
                  Principal / Head of School
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER ACTIONS (Hidden on Print) */}
        <div className="bg-white border-t p-4 flex justify-between items-center no-print px-10">
          <p className="text-xs text-slate-400 italic">
            Note: This document is intended for portrait printing on A4 paper.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 px-8"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-5 w-5" /> Generate PDF / Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
