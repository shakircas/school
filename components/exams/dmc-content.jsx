// "use client";

// import { useState, useRef } from "react";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { Download, Printer, GraduationCap } from "lucide-react";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// export function DMCContent() {
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [selectedExam, setSelectedExam] = useState("");
//   const dmcRef = useRef(null);
//   const { data: students } = useSWR("/api/students", fetcher);
//   const { data: exams } = useSWR("/api/exams", fetcher);
//   const { data: results, isLoading } = useSWR(
//     selectedStudent && selectedExam
//       ? `/api/results?studentId=${selectedStudent}&examId=${selectedExam}`
//       : null,
//     fetcher
//   );

//   const student = students?.data?.find((s) => s._id === selectedStudent);
//   const exam = exams?.data?.find((e) => e._id === selectedExam);
//   const result = results?.[0];
//   const subjects = result?.subjects || [];

//   const handlePrint = () => {
//     const printContent = dmcRef.current;
//     const windowPrint = window.open("", "", "width=800,height=600");
//     windowPrint.document.write(`
//       <html>
//         <head>
//           <title>DMC - ${student?.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .header { text-align: center; margin-bottom: 30px; }
//             .school-name { font-size: 24px; font-weight: bold; color: #1e40af; }
//             .title { font-size: 18px; margin-top: 10px; }
//             .student-info { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
//             .info-item { margin: 5px 0; }
//             .label { font-weight: bold; }
//             table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//             th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
//             th { background: #f3f4f6; }
//             .footer { margin-top: 40px; display: flex; justify-content: space-between; }
//             .signature { text-align: center; }
//             .signature-line { width: 150px; border-top: 1px solid #000; margin-top: 40px; }
//             .grade { padding: 2px 8px; border-radius: 4px; font-weight: bold; }
//             .grade-a { background: #22c55e; color: white; }
//             .grade-b { background: #3b82f6; color: white; }
//             .grade-c { background: #eab308; color: white; }
//             .grade-f { background: #ef4444; color: white; }
//           </style>
//         </head>
//         <body>
//           ${printContent.innerHTML}
//         </body>
//       </html>
//     `);
//     windowPrint.document.close();
//     windowPrint.print();
//   };

//   const getGrade = (percentage) => {
//     if (percentage >= 90) return { grade: "A+", class: "grade-a" };
//     if (percentage >= 80) return { grade: "A", class: "grade-a" };
//     if (percentage >= 70) return { grade: "B", class: "grade-b" };
//     if (percentage >= 60) return { grade: "C", class: "grade-c" };
//     if (percentage >= 50) return { grade: "D", class: "grade-c" };
//     return { grade: "F", class: "grade-f" };
//   };

//   // const totalObtained =
//   //   results?.data?.reduce((sum, r) => sum + (r.obtainedMarks || 0), 0) || 0;
//   // const totalMarks =
//   //   results?.data?.reduce((sum, r) => sum + (r.totalMarks || 0), 0) || 0;
//   // const percentage =
//   //   totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
//   // const overallGrade = getGrade(percentage);
//   const totalObtained = result?.obtainedMarks || 0;
//   const totalMarks = result?.totalMarks || 0;
//   const percentage = result?.percentage?.toFixed(2) || 0;
//   const overallGrade = getGrade(percentage);

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Detailed Mark Certificate (DMC)"
//         description="Generate DMCs for students"
//       >
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={handlePrint}
//             disabled={!selectedStudent || !selectedExam}
//           >
//             <Printer className="h-4 w-4 mr-2" />
//             Print
//           </Button>
//           <Button disabled={!selectedStudent || !selectedExam}>
//             <Download className="h-4 w-4 mr-2" />
//             Download PDF
//           </Button>
//         </div>
//       </PageHeader>

//       {/* Selection */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex flex-wrap gap-4">
//             <div className="w-64">
//               <Select
//                 value={selectedStudent}
//                 onValueChange={setSelectedStudent}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Student" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {students?.data?.map((student) => (
//                     <SelectItem key={student._id} value={student._id}>
//                       {student.name} - Class {student.class}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="w-64">
//               <Select value={selectedExam} onValueChange={setSelectedExam}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Examination" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {exams?.data?.map((exam) => (
//                     <SelectItem key={exam._id} value={exam._id}>
//                       {exam.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* DMC Preview */}
//       {selectedStudent && selectedExam && (
//         <Card>
//           <CardContent className="pt-6">
//             <div ref={dmcRef} className="bg-white p-8 border rounded-lg">
//               <div className="header text-center mb-8">
//                 <div className="flex justify-center mb-4">
//                   <GraduationCap className="h-16 w-16 text-primary" />
//                 </div>
//                 <h1 className="school-name text-2xl font-bold text-primary">
//                   EduManage School
//                 </h1>
//                 <p className="text-muted-foreground">Excellence in Education</p>
//                 <h2 className="title text-xl font-semibold mt-4">
//                   DETAILED MARK CERTIFICATE
//                 </h2>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   {exam?.name} - {new Date(exam?.date).getFullYear()}
//                 </p>
//               </div>

//               <div className="student-info grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
//                 <div className="info-item">
//                   <span className="label font-semibold">Student Name:</span>{" "}
//                   {student?.name}
//                 </div>
//                 <div className="info-item">
//                   <span className="label font-semibold">Roll Number:</span>{" "}
//                   {student?.rollNumber}
//                 </div>
//                 <div className="info-item">
//                   <span className="label font-semibold">Class:</span>{" "}
//                   {student?.class} - {student?.section}
//                 </div>
//                 <div className="info-item">
//                   <span className="label font-semibold">Father Name:</span>{" "}
//                   {student?.fatherName}
//                 </div>
//               </div>

//               {isLoading ? (
//                 <div className="flex justify-center py-8">
//                   <LoadingSpinner />
//                 </div>
//               ) : (
//                 <>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Subject</TableHead>
//                         <TableHead className="text-center">
//                           Total Marks
//                         </TableHead>
//                         <TableHead className="text-center">
//                           Obtained Marks
//                         </TableHead>
//                         <TableHead className="text-center">
//                           Percentage
//                         </TableHead>
//                         <TableHead className="text-center">Grade</TableHead>
//                         <TableHead className="text-center">Remarks</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {results?.map((result, index) => {
//                         const pct = (
//                           (result.obtainedMarks / result.totalMarks) *
//                           100
//                         ).toFixed(1);
//                         const gradeInfo = getGrade(pct);
//                         return (
//                           <TableRow key={index}>
//                             <TableCell className="font-medium capitalize">
//                               {result.subject || "Subject"}
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {result.totalMarks}
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {result.obtainedMarks}
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {pct}%
//                             </TableCell>
//                             <TableCell className="text-center">
//                               <span
//                                 className={`grade ${gradeInfo.class} px-2 py-1 rounded text-xs`}
//                               >
//                                 {gradeInfo.grade}
//                               </span>
//                             </TableCell>
//                             <TableCell className="text-center">
//                               {pct >= 50 ? "Pass" : "Fail"}
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })}
//                       <TableRow className="bg-muted/50 font-semibold">
//                         <TableCell>Total</TableCell>
//                         <TableCell className="text-center">
//                           {totalMarks}
//                         </TableCell>
//                         <TableCell className="text-center">
//                           {totalObtained}
//                         </TableCell>
//                         <TableCell className="text-center">
//                           {percentage}%
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <span
//                             className={`grade ${overallGrade.class} px-2 py-1 rounded text-xs`}
//                           >
//                             {overallGrade.grade}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           {percentage >= 50 ? "Pass" : "Fail"}
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>

//                   <div className="footer mt-12 flex justify-between px-8">
//                     <div className="signature text-center">
//                       <div className="signature-line border-t border-foreground w-32 mx-auto mt-12"></div>
//                       <p className="mt-2 text-sm">Class Teacher</p>
//                     </div>
//                     <div className="signature text-center">
//                       <div className="signature-line border-t border-foreground w-32 mx-auto mt-12"></div>
//                       <p className="mt-2 text-sm">Principal</p>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useRef, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Download, Printer, GraduationCap } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function DMCContent() {
  const dmcRef = useRef(null);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentId, setStudentId] = useState("");

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl =
    classId && sectionId
      ? `/api/students?classId=${classId}&sectionId=${sectionId}`
      : null;

  const { data: studentsRes } = useSWR(studentsUrl, fetcher);
  const [filters, setFilters] = useState({
    examId: "",
    classId: "",
    sectionId: "",
    student: "",
  });

  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.examId) params.append("examId", filters.examId);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);
    if (filters.student) params.append("student", filters.student);

    return `/api/results?${params.toString()}`;
  }, [filters]);

  const { data: results, isLoading } = useSWR(resultsUrl, fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];
  console.log(results);
  const exam = exams.find((e) => e._id === examId);
  const result = results?.[0];
  const subjects = result?.subjects || [];

  /* ---------------- Grade Helper ---------------- */
  const getGrade = (p) => {
    if (p >= 90) return { grade: "A+", class: "bg-green-600 text-white" };
    if (p >= 80) return { grade: "A", class: "bg-green-500 text-white" };
    if (p >= 70) return { grade: "B", class: "bg-blue-500 text-white" };
    if (p >= 60) return { grade: "C", class: "bg-yellow-500 text-black" };
    if (p >= 50) return { grade: "D", class: "bg-orange-500 text-white" };
    return { grade: "F", class: "bg-red-600 text-white" };
  };

  /* ---------------- Totals ---------------- */

  // const obtainedMarks =
  //   results?.reduce((sum, r) => sum + (r.obtainedMarks || 0), 0) || 0;
  // const totalMarks =
  //   results?.reduce((sum, r) => sum + (r.totalMarks || 0), 0) || 0;
  // const percentage =
  //   totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;
  // const overallGrade = getGrade(percentage);
  const obtainedMarks = result?.obtainedMarks || 0;
  const totalMarks = result?.totalMarks || 0;
  const percentage = result?.percentage?.toFixed(2) || 0;
  const overallGrade = getGrade(percentage);

  /* ---------------- Print ---------------- */
  const handlePrint = () => {
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`<html><body>${dmcRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detailed Mark Certificate (DMC)"
        description="Exam → Class → Section → Student"
      >
        <Button
          variant="outline"
          onClick={handlePrint}
          // disabled={!results?.length > 0}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </PageHeader>

      {/* ---------------- Selection ---------------- */}
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
          {/* Exam */}
          <Select
            value={examId}
            onValueChange={(v) => {
              setExamId(v);
              setClassId("");
              setSectionId("");
              setStudentId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name} ({e.examType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Class */}
          <Select
            value={classId}
            disabled={!examId}
            onValueChange={(v) => {
              setClassId(v);
              setSectionId("");
              setStudentId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section */}
          <Select
            value={sectionId}
            disabled={!classId}
            onValueChange={(v) => {
              setSectionId(v);
              setStudentId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {classes
                .find((c) => c._id === classId)
                ?.sections?.map((s) => (
                  <SelectItem key={s._id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Student */}
          <Select
            value={studentId}
            disabled={!sectionId}
            onValueChange={setStudentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ---------------- DMC ---------------- */}

      <Card>
        <CardContent className="pt-6">
          <div ref={dmcRef} className="p-8 bg-white border rounded-lg">
            <div className="text-center mb-8">
              <GraduationCap className="mx-auto h-14 w-14 text-primary mb-2" />
              <h1 className="text-2xl font-bold">EduManage School</h1>
              <p className="text-muted-foreground">Detailed Mark Certificate</p>
              <p className="mt-2 font-semibold">{exam?.name}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Obtained</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.subject}</TableCell>
                    <TableCell className="text-center">
                      {s.totalMarks}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.obtainedMarks}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          getGrade(s.percentage).class
                        }`}
                      >
                        {s.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-semibold bg-muted">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-center">{totalMarks}</TableCell>
                  <TableCell className="text-center">{obtainedMarks}</TableCell>
                  <TableCell className="text-center">{percentage}%</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${overallGrade.class}`}
                    >
                      {overallGrade.grade}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
