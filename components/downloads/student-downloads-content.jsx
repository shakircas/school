"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { FileSpreadsheet, FileText, Users, Printer, Eye } from "lucide-react"
import { exportToExcel, exportToCSV } from "@/lib/excel-utils"
import { generateStudentListPDF } from "@/lib/pdf-generator"

const fetcher = (url) => fetch(url).then((res) => res.json())

// Mock students for demo
const mockStudents = [
  {
    rollNumber: "001",
    name: "Ahmed Khan",
    class: "10",
    section: "A",
    fatherName: "Muhammad Khan",
    phone: "0300-1234567",
    email: "ahmed@email.com",
    status: "Active",
  },
  {
    rollNumber: "002",
    name: "Sara Ali",
    class: "10",
    section: "A",
    fatherName: "Ali Hassan",
    phone: "0301-2345678",
    email: "sara@email.com",
    status: "Active",
  },
  {
    rollNumber: "003",
    name: "Usman Ahmed",
    class: "9",
    section: "B",
    fatherName: "Ahmed Khan",
    phone: "0302-3456789",
    email: "usman@email.com",
    status: "Active",
  },
  {
    rollNumber: "004",
    name: "Fatima Zahra",
    class: "8",
    section: "A",
    fatherName: "Zaheer Abbas",
    phone: "0303-4567890",
    email: "fatima@email.com",
    status: "Active",
  },
  {
    rollNumber: "005",
    name: "Hassan Raza",
    class: "10",
    section: "B",
    fatherName: "Raza Khan",
    phone: "0304-5678901",
    email: "hassan@email.com",
    status: "Active",
  },
]

const availableFields = [
  { id: "rollNumber", label: "Roll Number", default: true },
  { id: "name", label: "Student Name", default: true },
  { id: "class", label: "Class", default: true },
  { id: "section", label: "Section", default: true },
  { id: "fatherName", label: "Father Name", default: true },
  { id: "phone", label: "Phone", default: true },
  { id: "email", label: "Email", default: false },
  { id: "dateOfBirth", label: "Date of Birth", default: false },
  { id: "gender", label: "Gender", default: false },
  { id: "address", label: "Address", default: false },
  { id: "admissionDate", label: "Admission Date", default: false },
  { id: "status", label: "Status", default: true },
]

export function StudentDownloadsContent() {
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFields, setSelectedFields] = useState(availableFields.filter((f) => f.default).map((f) => f.id))
  const [isExporting, setIsExporting] = useState(false)

  const { data: studentsData, isLoading } = useSWR("/api/students", fetcher, {
    fallbackData: { students: mockStudents },
  })

  const students = studentsData?.students || mockStudents

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === "all" || s.class === selectedClass
    const matchesSection = selectedSection === "all" || s.section === selectedSection
    const matchesStatus = selectedStatus === "all" || s.status === selectedStatus
    return matchesClass && matchesSection && matchesStatus
  })

  const toggleField = (fieldId) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((f) => f !== fieldId) : [...prev, fieldId]))
  }

  const prepareExportData = () => {
    return filteredStudents.map((student) => {
      const row = {}
      selectedFields.forEach((field) => {
        const fieldInfo = availableFields.find((f) => f.id === field)
        row[fieldInfo?.label || field] = student[field] || "-"
      })
      return row
    })
  }

  const handleExport = async (format) => {
    if (!filteredStudents.length) {
      toast({ title: "No Data", description: "No students to export.", variant: "destructive" })
      return
    }

    setIsExporting(true)
    try {
      const data = prepareExportData()
      const filename = `students-${selectedClass === "all" ? "all" : `class-${selectedClass}`}-${new Date().toISOString().split("T")[0]}`

      if (format === "excel") {
        exportToExcel(data, filename, "Students")
      } else if (format === "csv") {
        exportToCSV(data, filename)
      } else if (format === "pdf") {
        const doc = generateStudentListPDF(filteredStudents, {
          subtitle: selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`,
        })
        doc.save(`${filename}.pdf`)
      }

      toast({
        title: "Export Successful",
        description: `${filteredStudents.length} students exported to ${format.toUpperCase()}.`,
      })
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Download Student Data" description="Export student information in various formats" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
            <CardDescription>Select which students to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
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

            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {["A", "B", "C", "D"].map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{filteredStudents.length}</strong> students found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Fields</CardTitle>
            <CardDescription>Choose which fields to include in export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label htmlFor={field.id} className="cursor-pointer text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              {selectedFields.length} fields selected
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
            <CardDescription>Download in your preferred format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => handleExport("excel")}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              )}
              Export as Excel (.xlsx)
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
              )}
              Export as CSV (.csv)
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Printer className="h-4 w-4 mr-2 text-red-600" />
              )}
              Export as PDF
            </Button>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Export Summary</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Records: {filteredStudents.length}</p>
                <p>Fields: {selectedFields.length}</p>
                <p>Filter: {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>First 5 records that will be exported</CardDescription>
            </div>
            <Badge variant="secondary">
              <Eye className="h-3 w-3 mr-1" />
              Preview Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {selectedFields.map((field) => (
                      <th key={field} className="px-3 py-2 text-left font-medium text-muted-foreground">
                        {availableFields.find((f) => f.id === field)?.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 5).map((student, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      {selectedFields.map((field) => (
                        <td key={field} className="px-3 py-2">
                          {student[field] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length > 5 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  ... and {filteredStudents.length - 5} more records
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
