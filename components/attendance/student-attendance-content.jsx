"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { Calendar, Save, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const sections = ["A", "B", "C", "D"]
const attendanceStatuses = ["Present", "Absent", "Late", "Leave", "Half Day"]

export function StudentAttendanceContent() {
  const { toast } = useToast()
  const isOnline = useOnlineStatus()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [attendance, setAttendance] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Fetch students for selected class/section
  const { data: studentsData, isLoading: loadingStudents } = useSWR(
    selectedClass && selectedSection
      ? `/api/students?class=${selectedClass}&section=${selectedSection}&status=Active`
      : null,
    fetcher,
  )

  // Fetch existing attendance for the date
  const { data: existingAttendance, mutate: mutateAttendance } = useSWR(
    selectedClass && selectedSection && date
      ? `/api/attendance?date=${date}&type=Student&class=${selectedClass}&section=${selectedSection}`
      : null,
    fetcher,
  )

  const students = studentsData?.students || []

  // Initialize attendance from existing data
  useEffect(() => {
    if (existingAttendance?.[0]?.records) {
      const attendanceMap = {}
      existingAttendance[0].records.forEach((record) => {
        attendanceMap[record.personId] = record.status
      })
      setAttendance(attendanceMap)
    } else {
      // Default all to Present
      const defaultAttendance = {}
      students.forEach((student) => {
        defaultAttendance[student._id] = "Present"
      })
      setAttendance(defaultAttendance)
    }
  }, [existingAttendance, students])

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleMarkAll = (status) => {
    const newAttendance = {}
    students.forEach((student) => {
      newAttendance[student._id] = status
    })
    setAttendance(newAttendance)
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedSection) {
      toast({
        title: "Error",
        description: "Please select class and section",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const records = students.map((student) => ({
        personId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: attendance[student._id] || "Present",
      }))

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type: "Student",
          class: selectedClass,
          section: selectedSection,
          records,
        }),
      })

      if (response.ok) {
        toast({
          title: "Attendance saved",
          description: "Attendance has been marked successfully.",
        })
        mutateAttendance()
      } else {
        throw new Error("Failed to save attendance")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "Late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === "Present").length
  const absentCount = Object.values(attendance).filter((s) => s === "Absent").length
  const lateCount = Object.values(attendance).filter((s) => s === "Late").length

  return (
    <div className="space-y-6">
      <PageHeader title="Student Attendance" description="Mark daily attendance for students">
        {!isOnline && (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            Offline Mode
          </Badge>
        )}
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSave} disabled={isSaving || !students.length}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {students.length > 0 && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleMarkAll("Present")}>
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleMarkAll("Absent")}>
            Mark All Absent
          </Button>
        </div>
      )}

      {/* Attendance Table */}
      {loadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !selectedClass || !selectedSection ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select Class and Section</h3>
            <p className="text-muted-foreground">Choose a class and section to mark attendance</p>
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Students Found</h3>
            <p className="text-muted-foreground">
              No active students in Class {selectedClass} - {selectedSection}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.photo?.url || "/placeholder.svg"} />
                        <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>
                    <Select
                      value={attendance[student._id] || "Present"}
                      onValueChange={(value) => handleStatusChange(student._id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant={attendance[student._id] === "Present" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(student._id, "Present")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={attendance[student._id] === "Absent" ? "destructive" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(student._id, "Absent")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={attendance[student._id] === "Late" ? "secondary" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(student._id, "Late")}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
