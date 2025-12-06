"use client"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  GraduationCap,
  DollarSign,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
} from "recharts"

const fetcher = (url) => fetch(url).then((res) => res.json())

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

// Mock data for demonstration
const mockStats = {
  students: { active: 1234, total: 1300, newThisMonth: 45 },
  teachers: { active: 85, total: 92 },
  fees: { collected: 2500000, pending: 450000, total: 2950000 },
  attendance: { percentage: 94, present: 1160, absent: 74 },
  classWiseStudents: [
    { _id: "1", count: 120 },
    { _id: "2", count: 115 },
    { _id: "3", count: 130 },
    { _id: "4", count: 125 },
    { _id: "5", count: 140 },
    { _id: "6", count: 135 },
    { _id: "7", count: 128 },
    { _id: "8", count: 122 },
    { _id: "9", count: 110 },
    { _id: "10", count: 109 },
  ],
  recentAdmissions: [
    { name: "Ahmed Khan", class: "5", section: "A", createdAt: new Date() },
    { name: "Sara Ali", class: "3", section: "B", createdAt: new Date() },
    { name: "Usman Ahmed", class: "7", section: "A", createdAt: new Date() },
    { name: "Fatima Zahra", class: "1", section: "C", createdAt: new Date() },
  ],
}

const weeklyAttendance = [
  { day: "Mon", present: 1150, absent: 84, percentage: 93 },
  { day: "Tue", present: 1180, absent: 54, percentage: 96 },
  { day: "Wed", present: 1120, absent: 114, percentage: 91 },
  { day: "Thu", present: 1190, absent: 44, percentage: 96 },
  { day: "Fri", present: 1160, absent: 74, percentage: 94 },
]

const monthlyFees = [
  { month: "Jul", collected: 2100000, pending: 300000 },
  { month: "Aug", collected: 2300000, pending: 250000 },
  { month: "Sep", collected: 2400000, pending: 350000 },
  { month: "Oct", collected: 2200000, pending: 400000 },
  { month: "Nov", collected: 2500000, pending: 450000 },
  { month: "Dec", collected: 2600000, pending: 380000 },
]

const recentActivities = [
  { type: "admission", text: "New student Ahmed Khan admitted to Class 5-A", time: "2 minutes ago", icon: Plus },
  { type: "fee", text: "Fee payment received from Roll #1023", time: "15 minutes ago", icon: DollarSign },
  { type: "attendance", text: "Attendance marked for Class 8-B", time: "30 minutes ago", icon: UserCheck },
  { type: "exam", text: "Mid-term exam schedule published", time: "1 hour ago", icon: FileText },
  { type: "result", text: "Quiz results uploaded for Class 10", time: "2 hours ago", icon: CheckCircle2 },
]

function StatCard({ title, value, description, icon: Icon, trend, color = "primary" }) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs ${trend.type === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {trend.type === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${color === "primary" ? "bg-primary" : color === "success" ? "bg-green-500" : color === "warning" ? "bg-amber-500" : "bg-red-500"}`}
      />
    </Card>
  )
}

function QuickActionButton({ href, icon: Icon, label, color }) {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 flex flex-col gap-2 bg-transparent hover:bg-muted/50 transition-all"
      asChild
    >
      <Link href={href}>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </Button>
  )
}

export function DashboardContent() {
  const { data: apiStats, isLoading } = useSWR("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000,
    fallbackData: mockStats,
  })

  const stats = apiStats || mockStats

  const classData =
    stats?.classWiseStudents?.map((item) => ({
      name: `Class ${item._id}`,
      students: item.count,
    })) || []

  const feeData = [
    { name: "Collected", value: stats?.fees?.collected || 2500000 },
    { name: "Pending", value: stats?.fees?.pending || 450000 },
  ]

  const attendanceData = [
    { name: "Present", value: stats?.attendance?.present || 1160 },
    { name: "Absent", value: stats?.attendance?.absent || 74 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your school today.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/students/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.students?.active?.toLocaleString() || "1,234"}
          description={`${stats?.students?.newThisMonth || 45} new this month`}
          icon={GraduationCap}
          trend={{ type: "up", value: "+3.2% from last month" }}
          color="primary"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.teachers?.active || 85}
          description={`${stats?.teachers?.total || 92} total staff`}
          icon={Users}
          color="success"
        />
        <StatCard
          title="Fee Collection"
          value={`Rs. ${((stats?.fees?.collected || 2500000) / 100000).toFixed(1)}L`}
          description={`Rs. ${((stats?.fees?.pending || 450000) / 1000).toFixed(0)}K pending`}
          icon={DollarSign}
          trend={{ type: "up", value: "+8.5% from last month" }}
          color="warning"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats?.attendance?.percentage || 94}%`}
          description={`${stats?.attendance?.present || 1160} present today`}
          icon={UserCheck}
          trend={{ type: stats?.attendance?.percentage >= 90 ? "up" : "down", value: "Target: 95%" }}
          color={stats?.attendance?.percentage >= 90 ? "success" : "danger"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Weekly Attendance</CardTitle>
                <CardDescription>Student attendance trend this week</CardDescription>
              </div>
              <Badge variant="secondary" className="font-normal">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="day" className="text-xs" axisLine={false} tickLine={false} />
                  <YAxis className="text-xs" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [value, name === "present" ? "Present" : "Absent"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#presentGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fee Collection</CardTitle>
                <CardDescription>Monthly fee collection trend</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/fees/reports">View Details</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFees}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                  <YAxis
                    className="text-xs"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Collected" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class-wise Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Students by Class</CardTitle>
            <CardDescription>Distribution across classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" className="text-xs" axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    className="text-xs"
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="students" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
                <CardDescription>Latest updates from your school</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.type === "admission"
                        ? "bg-blue-500/10 text-blue-600"
                        : activity.type === "fee"
                          ? "bg-green-500/10 text-green-600"
                          : activity.type === "attendance"
                            ? "bg-purple-500/10 text-purple-600"
                            : activity.type === "exam"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-primary/10 text-primary"
                    }`}
                  >
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <QuickActionButton
              href="/students/add"
              icon={GraduationCap}
              label="Add Student"
              color="bg-blue-500/10 text-blue-600"
            />
            <QuickActionButton
              href="/teachers/add"
              icon={Users}
              label="Add Teacher"
              color="bg-green-500/10 text-green-600"
            />
            <QuickActionButton
              href="/attendance/students"
              icon={UserCheck}
              label="Attendance"
              color="bg-purple-500/10 text-purple-600"
            />
            <QuickActionButton
              href="/fees"
              icon={DollarSign}
              label="Collect Fee"
              color="bg-amber-500/10 text-amber-600"
            />
            <QuickActionButton href="/exams" icon={FileText} label="Exams" color="bg-red-500/10 text-red-600" />
            <QuickActionButton
              href="/quizzes/create"
              icon={BookOpen}
              label="Create Quiz"
              color="bg-cyan-500/10 text-cyan-600"
            />
            <QuickActionButton href="/ai/papers" icon={Brain} label="AI Papers" color="bg-pink-500/10 text-pink-600" />
            <QuickActionButton
              href="/downloads/students"
              icon={Download}
              label="Downloads"
              color="bg-indigo-500/10 text-indigo-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Admissions & Fee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Admissions</CardTitle>
                <CardDescription>Latest student enrollments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/students/admissions">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.recentAdmissions || mockStats.recentAdmissions)?.slice(0, 5).map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/diverse-students-studying.png?height=40&width=40&query=student ${student.name}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {student.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {student.class} - Section {student.section}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fee Summary</CardTitle>
                <CardDescription>Collection overview</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/fees/reports">View Report</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {feeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f59e0b"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `Rs. ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Collected</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {((stats?.fees?.collected || 2500000) / 100000).toFixed(2)}L
                  </p>
                  <Progress value={85} className="h-2 mt-2" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    Rs. {((stats?.fees?.pending || 450000) / 100000).toFixed(2)}L
                  </p>
                  <Progress value={15} className="h-2 mt-2 [&>div]:bg-amber-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Missing import
import { BarChart3, Brain, Download } from "lucide-react"
