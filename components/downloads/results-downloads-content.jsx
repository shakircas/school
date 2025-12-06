"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileSpreadsheet, FileText, Trophy } from "lucide-react"
import { toast } from "sonner"
import { exportToCSV, exportToExcel } from "@/lib/excel-utils"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function ResultsDownloadsContent() {
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedExam, setSelectedExam] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const { data: exams } = useSWR("/api/exams", fetcher)
  const { data: results, isLoading } = useSWR(selectedExam ? `/api/results?exam=${selectedExam}` : null, fetcher)

  const handleExport = async (format) => {
    if (!results?.data?.length) {
      toast.error("No results to export")
      return
    }

    setIsExporting(true)
    try {
      const data = results.data.map((result) => ({
        "Student Name": result.student?.name || "",
        "Roll Number": result.student?.rollNumber || "",
        Class: result.student?.class || "",
        Section: result.student?.section || "",
        Exam: result.exam?.name || "",
        "Obtained Marks": result.obtainedMarks,
        "Total Marks": result.totalMarks,
        Percentage: ((result.obtainedMarks / result.totalMarks) * 100).toFixed(2) + "%",
        Grade: getGrade((result.obtainedMarks / result.totalMarks) * 100),
        Status: result.obtainedMarks >= result.totalMarks * 0.33 ? "Pass" : "Fail",
      }))

      if (format === "csv") {
        exportToCSV(data, `results_${selectedExam}`)
      } else {
        exportToExcel(data, `results_${selectedExam}`)
      }

      toast.success(`Exported ${data.length} results`)
    } catch (error) {
      toast.error("Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    if (percentage >= 50) return "D"
    return "F"
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Download Results" description="Export exam results and reports" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Data</CardTitle>
            <CardDescription>Choose exam and class to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Examination</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.data?.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - Class {exam.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Class (Optional)</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && <LoadingSpinner />}

            <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{results?.data?.length || 0} results found</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Download results in your preferred format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => handleExport("csv")} disabled={isExporting || !selectedExam}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>

            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting || !selectedExam}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Included Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Student Name & Roll Number</li>
                <li>Class & Section</li>
                <li>Obtained & Total Marks</li>
                <li>Percentage & Grade</li>
                <li>Pass/Fail Status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
