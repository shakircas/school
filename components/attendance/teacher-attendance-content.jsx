"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, CheckCircle2, XCircle, Clock, AlertCircle, Save, RefreshCw } from "lucide-react"
import { format } from "date-fns"

const fetcher = (url) => fetch(url).then((res) => res.json())

const mockTeachers = [
  { _id: "1", employeeId: "T001", name: "Muhammad Ali", department: "Science", designation: "Senior Teacher" },
  { _id: "2", employeeId: "T002", name: "Fatima Khan", department: "Mathematics", designation: "Head of Dept" },
  { _id: "3", employeeId: "T003", name: "Ahmed Hassan", department: "English", designation: "Teacher" },
  { _id: "4", employeeId: "T004", name: "Ayesha Malik", department: "Urdu", designation: "Teacher" },
  { _id: "5", employeeId: "T005", name: "Usman Raza", department: "Computer", designation: "Lab Instructor" },
  { _id: "6", employeeId: "T006", name: "Sara Ahmed", department: "Social Studies", designation: "Teacher" },
]

const departments = ["All", "Science", "Mathematics", "English", "Urdu", "Computer", "Social Studies"]

export function TeacherAttendanceContent() {
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [attendance, setAttendance] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { data: teachersData, isLoading } = useSWR(`/api/teachers`, fetcher, {
    fallbackData: { teachers: mockTeachers },
  })

  const teachers = teachersData?.teachers || mockTeachers

  useEffect(() => {
    const defaultAttendance = {}
    teachers.forEach((teacher) => {
      defaultAttendance[teacher._id] = "present"
    })
    setAttendance(defaultAttendance)
  }, [teachers])

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || teacher.employeeId.includes(searchQuery)
    const matchesDept = selectedDepartment === "All" || teacher.department === selectedDepartment
    return matchesSearch && matchesDept
  })

  const handleAttendanceChange = (teacherId, status) => {
    setAttendance((prev) => ({ ...prev, [teacherId]: status }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Attendance Saved",
        description: "Teacher attendance has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance.",
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

  return (
    <div className="space-y-6">
      <PageHeader title="Teacher Attendance" description="Mark and manage daily teacher attendance">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-1.5">
              <Label>&nbsp;</Label>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{counts.present}</p>
              <p className="text-xs text-green-600/80">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{counts.absent}</p>
              <p className="text-xs text-red-600/80">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{counts.late}</p>
              <p className="text-xs text-amber-600/80">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{counts.leave}</p>
              <p className="text-xs text-blue-600/80">On Leave</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</CardTitle>
          <CardDescription>{filteredTeachers.length} teachers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner size="lg" className="mx-auto" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher._id} className="border-l-4 border-l-primary">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.department}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {teacher.employeeId}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {["present", "absent", "late", "leave"].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={attendance[teacher._id] === status ? "default" : "outline"}
                          className={`h-7 text-xs capitalize ${
                            attendance[teacher._id] === status
                              ? status === "present"
                                ? "bg-green-500"
                                : status === "absent"
                                  ? "bg-red-500"
                                  : status === "late"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              : ""
                          }`}
                          onClick={() => handleAttendanceChange(teacher._id, status)}
                        >
                          {status.charAt(0).toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
