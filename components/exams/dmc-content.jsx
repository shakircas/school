"use client"

import { useState, useRef } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Download, Printer, GraduationCap } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function DMCContent() {
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const dmcRef = useRef(null)
  const { data: students } = useSWR("/api/students", fetcher)
  const { data: exams } = useSWR("/api/exams", fetcher)
  const { data: results, isLoading } = useSWR(
    selectedStudent && selectedExam ? `/api/results?student=${selectedStudent}&exam=${selectedExam}` : null,
    fetcher,
  )

  const student = students?.data?.find((s) => s._id === selectedStudent)
  const exam = exams?.data?.find((e) => e._id === selectedExam)

  const handlePrint = () => {
    const printContent = dmcRef.current
    const windowPrint = window.open("", "", "width=800,height=600")
    windowPrint.document.write(`
      <html>
        <head>
          <title>DMC - ${student?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: bold; color: #1e40af; }
            .title { font-size: 18px; margin-top: 10px; }
            .student-info { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { margin: 5px 0; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f3f4f6; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .signature-line { width: 150px; border-top: 1px solid #000; margin-top: 40px; }
            .grade { padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            .grade-a { background: #22c55e; color: white; }
            .grade-b { background: #3b82f6; color: white; }
            .grade-c { background: #eab308; color: white; }
            .grade-f { background: #ef4444; color: white; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    windowPrint.document.close()
    windowPrint.print()
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", class: "grade-a" }
    if (percentage >= 80) return { grade: "A", class: "grade-a" }
    if (percentage >= 70) return { grade: "B", class: "grade-b" }
    if (percentage >= 60) return { grade: "C", class: "grade-c" }
    if (percentage >= 50) return { grade: "D", class: "grade-c" }
    return { grade: "F", class: "grade-f" }
  }

  const totalObtained = results?.data?.reduce((sum, r) => sum + (r.obtainedMarks || 0), 0) || 0
  const totalMarks = results?.data?.reduce((sum, r) => sum + (r.totalMarks || 0), 0) || 0
  const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0
  const overallGrade = getGrade(percentage)

  return (
    <div className="space-y-6">
      <PageHeader title="Detailed Mark Certificate (DMC)" description="Generate DMCs for students">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={!selectedStudent || !selectedExam}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button disabled={!selectedStudent || !selectedExam}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </PageHeader>

      {/* Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.data?.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Examination" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.data?.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DMC Preview */}
      {selectedStudent && selectedExam && (
        <Card>
          <CardContent className="pt-6">
            <div ref={dmcRef} className="bg-white p-8 border rounded-lg">
              <div className="header text-center mb-8">
                <div className="flex justify-center mb-4">
                  <GraduationCap className="h-16 w-16 text-primary" />
                </div>
                <h1 className="school-name text-2xl font-bold text-primary">EduManage School</h1>
                <p className="text-muted-foreground">Excellence in Education</p>
                <h2 className="title text-xl font-semibold mt-4">DETAILED MARK CERTIFICATE</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {exam?.name} - {new Date(exam?.date).getFullYear()}
                </p>
              </div>

              <div className="student-info grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="info-item">
                  <span className="label font-semibold">Student Name:</span> {student?.name}
                </div>
                <div className="info-item">
                  <span className="label font-semibold">Roll Number:</span> {student?.rollNumber}
                </div>
                <div className="info-item">
                  <span className="label font-semibold">Class:</span> {student?.class} - {student?.section}
                </div>
                <div className="info-item">
                  <span className="label font-semibold">Father Name:</span> {student?.fatherName}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Total Marks</TableHead>
                        <TableHead className="text-center">Obtained Marks</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results?.data?.map((result, index) => {
                        const pct = ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
                        const gradeInfo = getGrade(pct)
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium capitalize">{result.subject || "Subject"}</TableCell>
                            <TableCell className="text-center">{result.totalMarks}</TableCell>
                            <TableCell className="text-center">{result.obtainedMarks}</TableCell>
                            <TableCell className="text-center">{pct}%</TableCell>
                            <TableCell className="text-center">
                              <span className={`grade ${gradeInfo.class} px-2 py-1 rounded text-xs`}>
                                {gradeInfo.grade}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{pct >= 50 ? "Pass" : "Fail"}</TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{totalMarks}</TableCell>
                        <TableCell className="text-center">{totalObtained}</TableCell>
                        <TableCell className="text-center">{percentage}%</TableCell>
                        <TableCell className="text-center">
                          <span className={`grade ${overallGrade.class} px-2 py-1 rounded text-xs`}>
                            {overallGrade.grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{percentage >= 50 ? "Pass" : "Fail"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="footer mt-12 flex justify-between px-8">
                    <div className="signature text-center">
                      <div className="signature-line border-t border-foreground w-32 mx-auto mt-12"></div>
                      <p className="mt-2 text-sm">Class Teacher</p>
                    </div>
                    <div className="signature text-center">
                      <div className="signature-line border-t border-foreground w-32 mx-auto mt-12"></div>
                      <p className="mt-2 text-sm">Principal</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
