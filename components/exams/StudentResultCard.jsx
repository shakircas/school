"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { QrCode, ShieldCheck, Award } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function StudentResultCard({ result }) {
  const total = result.subjects.reduce(
    (sum, s) => sum + Number(s.totalMarks),
    0,
  );
  const obtained = result.subjects.reduce(
    (sum, s) => sum + Number(s.obtainedMarks),
    0,
  );
  const percentage = ((obtained / total) * 100).toFixed(1);

  const calculateGrade = (score, isPercentage = false) => {
    const val = isPercentage ? score : (score / 100) * 100;
    if (val >= 80)
      return {
        label: "A+",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    if (val >= 70)
      return {
        label: "A",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    if (val >= 60)
      return {
        label: "B",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    if (val >= 50)
      return {
        label: "C",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    if (val >= 40)
      return {
        label: "D",
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
      };
    return {
      label: "F",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  };

  const finalGrade = calculateGrade(percentage, true);

  const verificationUrl = `https://localhost:3000/verify/${result._id}`;

  return (
    <Card className="relative overflow-hidden border-2 border-slate-900 shadow-none bg-white mb-8 print:mb-0 print:border-slate-950 break-inside-avoid">
      <div className="p-8 flex flex-col justify-between h-[520px] print:h-[48vh]">
        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <Award size={320} className="-rotate-12" />
        </div>

        <div className="relative z-10">
          {/* TOP HEADER */}
          <div className="flex justify-between items-center border-b-4 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-slate-900 text-white flex items-center justify-center rounded-full text-2xl font-black">
                EMS
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-none italic">
                  EduManage Academy
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Detailed Marks Certificate
                </p>
              </div>
            </div>
            <div className="text-right border-l-2 border-slate-200 pl-4">
              <h3 className="text-lg font-bold text-slate-900 uppercase leading-none">
                {result.exam?.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                Session {result.academicYear}
              </p>
            </div>
          </div>

          {/* STUDENT PROFILE BOX */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="col-span-3 grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div>
                <p className="text-[9px] uppercase text-slate-400 font-black">
                  Full Name
                </p>
                <p className="text-sm font-bold uppercase text-slate-900">
                  {result.student?.name}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-slate-400 font-black">
                  Enrollment No.
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {result.student?.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-slate-400 font-black">
                  Grade & Section
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {result.classId?.name} — {result.sectionId}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">
                  Identity Verified
                </p>
              </div>
            </div>
            <div className="flex justify-end items-center">
              <Avatar className="h-24 w-24 rounded-xl border-2 border-slate-900 shadow-md">
                <AvatarImage
                  src={result.student?.photo}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold">
                  {result.student?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* ACADEMIC PERFORMANCE TABLE */}
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                <th className="py-2.5 px-4 text-left">Subject Detail</th>
                <th className="py-2.5 px-4 text-center">Total</th>
                <th className="py-2.5 px-4 text-center">Obtained</th>
                <th className="py-2.5 px-4 text-center">Grade</th>
                <th className="py-2.5 px-4 text-right">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result.subjects.map((s, i) => {
                const subGrade = calculateGrade(
                  (s.obtainedMarks / s.totalMarks) * 100,
                  true,
                );
                return (
                  <tr key={i} className="text-xs font-semibold">
                    <td className="py-3 px-4 text-slate-700 uppercase">
                      {s.subject}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {s.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-slate-900">
                      {s.obtainedMarks}
                    </td>
                    <td
                      className={`py-3 px-4 text-center font-black ${subGrade.color}`}
                    >
                      {subGrade.label}
                    </td>
                    <td className="py-3 px-4 text-right text-[9px] font-black italic text-slate-400">
                      {s.obtainedMarks >= s.totalMarks * 0.33
                        ? "CREDIT"
                        : "RE-ENTRY"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* VALIDATION & OFFICIAL FOOTER */}
        <div className="flex justify-between items-end border-t-4 border-slate-900 pt-6 mt-4">
          <div className="flex gap-6 items-center">
            <div className="p-1.5 border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <QRCodeSVG value={verificationUrl} size={60} />
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter text-slate-900">
                  {percentage}%
                </span>
                <span
                  className={`text-xs font-black uppercase px-2 py-0.5 rounded border-2 ${finalGrade.border} ${finalGrade.color}`}
                >
                  {finalGrade.label}
                </span>
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase leading-none">
                Summary: {obtained} / {total} Total Marks
              </p>
            </div>
          </div>

          <div className="flex gap-16">
            <div className="text-center">
              <div className="h-14 w-32 border-b-2 border-slate-200 mb-2 flex items-center justify-center">
                {/* This would be an img tag for a real scanned signature */}
                <span className="text-[8px] font-serif text-slate-300 italic">
                  Digitally Signed
                </span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest">
                Examiner
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-32 border-b-2 border-slate-900 mb-2 flex items-center justify-center">
                <div className="text-blue-900 font-serif italic text-lg opacity-80 -rotate-3 select-none">
                  EduManage
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                Principal
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
