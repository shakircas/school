"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { Download, FileText, Calendar, Users, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const monthlyData = [
  { month: "Jul", attendance: 92 },
  { month: "Aug", attendance: 94 },
  { month: "Sep", attendance: 91 },
  { month: "Oct", attendance: 95 },
  { month: "Nov", attendance: 93 },
  { month: "Dec", attendance: 96 },
]

const classWiseData = [
  { class: "Class 1", percentage: 95 },
  { class: "Class 2", percentage: 92 },
  { class: "Class 3", percentage: 94 },
  { class: "Class 4", percentage: 91 },
  { class: "Class 5", percentage: 93 },
  { class: "Class 6", percentage: 90 },
  { class: "Class 7", percentage: 88 },
  { class: "Class 8", percentage: 92 },
  { class: "Class 9", percentage: 89 },
  { class: "Class 10", percentage: 94 },
]

const lowAttendanceStudents = [
  { rollNumber: "023", name: "Hamza Ali", class: "8-A", percentage: 65, absents: 18 },
  { rollNumber: "045", name: "Zara Khan", class: "7-B", percentage: 68, absents: 16 },
  { rollNumber: "089", name: "Bilal Ahmed", class: "9-A", percentage: 70, absents: 15 },
  { rollNumber: "012", name: "Sana Fatima", class: "6-C", percentage: 72, absents: 14 },
  { rollNumber: "067", name: "Imran Hassan", class: "10-B", percentage: 73, absents: 13 },
]

export function AttendanceReportsContent() {
  const [reportType, setReportType] = useState("monthly")
  const [selectedClass, setSelectedClass] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Reports" description="Analyze attendance patterns and generate reports">
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <SelectItem key={c} value={c.toString()}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Attendance</p>
                <p className="text-3xl font-bold text-green-600">93.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Working Days</p>
                <p className="text-3xl font-bold">124</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-3xl font-bold">45</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>Average attendance percentage by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[80, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value}%`, "Attendance"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-wise Attendance</CardTitle>
            <CardDescription>Attendance comparison across classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classWiseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="class" className="text-xs" />
                  <YAxis domain={[80, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value}%`, "Attendance"]}
                  />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Students */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students with Low Attendance</CardTitle>
              <CardDescription>Students with attendance below 75%</CardDescription>
            </div>
            <Badge variant="destructive">{lowAttendanceStudents.length} Students</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Absents</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowAttendanceStudents.map((student) => (
                <TableRow key={student.rollNumber}>
                  <TableCell className="font-medium">{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.percentage} className="w-20 h-2" />
                      <span className="text-sm font-medium">{student.percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.absents} days</TableCell>
                  <TableCell>
                    <Badge variant={student.percentage < 70 ? "destructive" : "warning"}>
                      {student.percentage < 70 ? "Critical" : "Warning"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
