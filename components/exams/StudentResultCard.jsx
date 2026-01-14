// components/results/student-result-card.jsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "../ui/card";

export function StudentResultCard({ result }) {
  const total = result.subjects.reduce(
    (sum, s) => sum + Number(s.totalMarks),
    0
  );

  const obtained = result.subjects.reduce(
    (sum, s) => sum + Number(s.obtainedMarks),
    0
  );

  const percentage = ((obtained / total) * 100).toFixed(2);

 const getGrade = () => {
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  return (
    <Card>
    <div className="relative border border-black rounded-md p-4 text-[11px] print:break-inside-avoid overflow-hidden">
      {/* WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[48px] font-bold uppercase text-black/5 rotate-[-30deg]">
          EduManage School
        </span>
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-black pb-2 mb-2">
          <div>
            <h2 className="font-bold uppercase text-sm">EduManage School</h2>
            <p className="text-[10px]">Examination Result Card</p>
          </div>

          <Avatar className="h-12 w-12 border border-black">
            <AvatarImage src={result.student?.photo} />
            <AvatarFallback>{result.student?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* STUDENT INFO */}
        <div className="grid grid-cols-2 gap-y-1 mb-3">
          <p>
            <b>Name:</b> {result.student?.name}
          </p>
          <p>
            <b>Roll No:</b> {result.student?.rollNumber}
          </p>
          <p>
            <b>Class:</b> {result.classId?.name} – {result.sectionId}
          </p>
          <p>
            <b>Exam:</b> {result.exam?.name}
          </p>
          <p>
            <b>Session:</b> {result.academicYear}
          </p>
          <p>
            <b>Status:</b> {result.status}
          </p>
        </div>

        {/* SUBJECT TABLE */}
        <table className="w-full border border-black text-[10px]">
          <thead>
            <tr className="border-b border-black">
              <th className="p-1 w-6">#</th>
              <th className="p-1 text-left">Subject</th>
              <th className="p-1 text-right">Total</th>
              <th className="p-1 text-right">Obt.</th>
              <th className="p-1 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {result.subjects.map((s, i) => (
              <tr key={i} className="border-b last:border-b-0 border-black">
                <td className="p-1 text-center">{i + 1}</td>
                <td className="p-1">{s.subject}</td>
                <td className="p-1 text-right">{s.totalMarks}</td>
                <td className="p-1 text-right">{s.obtainedMarks}</td>
                <td className="p-1 text-right">{getGrade(s.obtainedMarks)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-y-1 mt-3">
          <p>
            <b>Total Marks:</b> {total}
          </p>
          <p>
            <b>Obtained:</b> {obtained}
          </p>
          <p>
            <b>Percentage:</b> {percentage}%
          </p>
          <p>
            <b>Grade:</b> {getGrade(percentage)}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-4 flex justify-between items-end text-[10px]">
          <p>Issued: {new Date().toLocaleDateString()}</p>
          <div className="text-right">
            <div className="border-t border-black w-24 mb-1"></div>
            <p>Controller of Examinations</p>
          </div>
        </div>
      </div>
    </div>
    </Card>
  );
}
