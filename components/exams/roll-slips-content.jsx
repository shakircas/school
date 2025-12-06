"use client"

import { useState, useRef } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Printer, School } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function RollSlipsContent() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const slipRef = useRef(null)
  const { data: students, isLoading } = useSWR(selectedClass ? `/api/students?class=${selectedClass}` : null, fetcher)
  const { data: exams } = useSWR("/api/exams", fetcher)

  const exam = exams?.data?.find((e) => e._id === selectedExam)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Roll Number Slips" description="Generate roll number slips for examinations">
        <Button variant="outline" onClick={handlePrint} disabled={!selectedClass || !selectedExam}>
          <Printer className="h-4 w-4 mr-2" />
          Print All
        </Button>
      </PageHeader>

      {/* Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
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

      {/* Roll Slips Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : selectedClass && selectedExam && students?.data?.length > 0 ? (
        <div ref={slipRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          {students.data.map((student) => (
            <Card key={student._id} className="print:break-inside-avoid">
              <CardContent className="p-6">
                <div className="border-2 border-primary rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <School className="h-10 w-10 text-primary" />
                      <div>
                        <h3 className="font-bold text-lg text-primary">EduManage School</h3>
                        <p className="text-xs text-muted-foreground">Excellence in Education</p>
                      </div>
                    </div>
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={student.photo || `/placeholder.svg?height=64&width=64&query=student`} />
                      <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-primary uppercase">Roll Number Slip</h4>
                    <p className="text-sm text-muted-foreground">{exam?.name}</p>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold">Roll No:</span>
                      <span className="text-primary font-bold">{student.rollNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">Class:</span>
                      <span>
                        {student.class} - {student.section}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <span className="font-semibold">Name:</span>
                      <span>{student.name}</span>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <span className="font-semibold">Father:</span>
                      <span>{student.fatherName}</span>
                    </div>
                  </div>

                  {/* Exam Info */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">Date:</span> {new Date(exam?.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Time:</span> {exam?.startTime} - {exam?.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t flex justify-between items-end text-xs">
                    <div>
                      <p className="text-muted-foreground">Issued Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-foreground w-24 mb-1"></div>
                      <p>Principal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedClass && selectedExam ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No students found in Class {selectedClass}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
