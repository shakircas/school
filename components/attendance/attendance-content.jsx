"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { Clock, Search, Download, Upload, CheckCircle2, XCircle, AlertCircle, Save, RefreshCw } from "lucide-react"
import { format } from "date-fns"

const fetcher = (url) => fetch(url).then((res) => res.json())

// Mock student data
const mockStudents = [
  { _id: "1", rollNumber: "001", name: "Ahmed Khan", class: "10", section: "A", photo: null },
  { _id: "2", rollNumber: "002", name: "Sara Ali", class: "10", section: "A", photo: null },
  { _id: "3", rollNumber: "003", name: "Usman Ahmed", class: "10", section: "A", photo: null },
  { _id: "4", rollNumber: "004", name: "Fatima Zahra", class: "10", section: "A", photo: null },
  { _id: "5", rollNumber: "005", name: "Hassan Raza", class: "10", section: "A", photo: null },
  { _id: "6", rollNumber: "006", name: "Ayesha Bibi", class: "10", section: "A", photo: null },
  { _id: "7", rollNumber: "007", name: "Ali Hassan", class: "10", section: "A", photo: null },
  { _id: "8", rollNumber: "008", name: "Zainab Fatima", class: "10", section: "A", photo: null },
  { _id: "9", rollNumber: "009", name: "Ibrahim Khan", class: "10", section: "A", photo: null },
  { _id: "10", rollNumber: "010", name: "Maryam Ali", class: "10", section: "A", photo: null },
]

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
const sections = ["A", "B", "C", "D"]

export function AttendanceContent() {
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState("10")
  const [selectedSection, setSelectedSection] = useState("A")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [attendance, setAttendance] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  // Fetch students
  const { data: studentsData, isLoading: loadingStudents } = useSWR(
    `/api/students?class=${selectedClass}&section=${selectedSection}`,
    fetcher,
    { fallbackData: { students: mockStudents } },
  )

  // Fetch existing attendance
  const {
    data: existingAttendance,
    isLoading: loadingAttendance,
    mutate,
  } = useSWR(`/api/attendance?class=${selectedClass}&section=${selectedSection}&date=${selectedDate}`, fetcher)

  const students = studentsData?.students || mockStudents

  // Initialize attendance state
  useEffect(() => {
    if (existingAttendance?.attendance) {
      const attendanceMap = {}
      existingAttendance.attendance.forEach((record) => {
        attendanceMap[record.studentId] = record.status
      })
      setAttendance(attendanceMap)
    } else {
      // Default all to present
      const defaultAttendance = {}
      students.forEach((student) => {
        defaultAttendance[student._id] = "present"
      })
      setAttendance(defaultAttendance)
    }
  }, [existingAttendance, students])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.rollNumber.includes(searchQuery),
  )

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAll = (status) => {
    setIsMarkingAll(true)
    const newAttendance = {}
    filteredStudents.forEach((student) => {
      newAttendance[student._id] = status
    })
    setAttendance((prev) => ({ ...prev, ...newAttendance }))
    setTimeout(() => setIsMarkingAll(false), 300)
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
        date: selectedDate,
        class: selectedClass,
        section: selectedSection,
      }))

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: attendanceRecords }),
      })

      if (response.ok) {
        toast({
          title: "Attendance Saved",
          description: `Attendance for Class ${selectedClass}-${selectedSection} has been saved successfully.`,
        })
        mutate()
      } else {
        throw new Error("Failed to save")
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

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 }
    Object.values(attendance).forEach((status) => {
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }

  const counts = getStatusCounts()
  const totalStudents = filteredStudents.length
  const attendancePercentage = totalStudents > 0 ? Math.round((counts.present / totalStudents) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Student Attendance" description="Mark and manage daily student attendance">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
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
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or Roll No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>&nbsp;</Label>
              <Button onClick={handleSaveAttendance} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{counts.present}</p>
              <p className="text-xs text-green-600/80">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{counts.absent}</p>
              <p className="text-xs text-red-600/80">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{counts.late}</p>
              <p className="text-xs text-amber-600/80">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{counts.leave}</p>
              <p className="text-xs text-blue-600/80">On Leave</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                Class {selectedClass}-{selectedSection} | {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {totalStudents} students | {attendancePercentage}% present
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("present")}
                disabled={isMarkingAll}
                className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("absent")}
                disabled={isMarkingAll}
                className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
              >
                <XCircle className="h-4 w-4 mr-1" />
                All Absent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredStudents.map((student) => (
                <AttendanceCard
                  key={student._id}
                  student={student}
                  status={attendance[student._id] || "present"}
                  onChange={(status) => handleAttendanceChange(student._id, status)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AttendanceCard({ student, status, onChange }) {
  const statusConfig = {
    present: { color: "bg-green-500", borderColor: "border-green-500", icon: CheckCircle2 },
    absent: { color: "bg-red-500", borderColor: "border-red-500", icon: XCircle },
    late: { color: "bg-amber-500", borderColor: "border-amber-500", icon: Clock },
    leave: { color: "bg-blue-500", borderColor: "border-blue-500", icon: AlertCircle },
  }

  const config = statusConfig[status] || statusConfig.present

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${config.borderColor} border-l-4`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.photo?.url || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground">Roll #{student.rollNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-3">
          {["present", "absent", "late", "leave"].map((s) => {
            const Icon = statusConfig[s].icon
            return (
              <Button
                key={s}
                size="sm"
                variant={status === s ? "default" : "outline"}
                className={`h-8 px-2 text-xs ${status === s ? statusConfig[s].color : ""}`}
                onClick={() => onChange(s)}
              >
                <Icon className="h-3 w-3" />
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
