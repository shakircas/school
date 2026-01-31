// "use client";
// import useSWR from "swr";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Progress } from "@/components/ui/progress";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import {
//   Users,
//   GraduationCap,
//   DollarSign,
//   UserCheck,
//   TrendingUp,
//   TrendingDown,
//   ArrowRight,
//   Plus,
//   BookOpen,
//   FileText,
//   Clock,
//   CheckCircle2,
//   Activity,
//   Wallet,
//   CalendarCheck,
//   UserPlus,
// } from "lucide-react";
// import Link from "next/link";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Line,
// } from "recharts";
// import { formatDistanceToNow } from "date-fns";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// const CHART_COLORS = [
//   "#3b82f6",
//   "#10b981",
//   "#f59e0b",
//   "#ef4444",
//   "#8b5cf6",
//   "#ec4899",
// ];

// // Mock data for demonstration

// function StatCard({
//   title,
//   value,
//   description,
//   icon: Icon,
//   trend,
//   color = "primary",
// }) {
//   const colorClasses = {
//     primary: "bg-primary/10 text-primary",
//     success: "bg-green-500/10 text-green-600",
//     warning: "bg-amber-500/10 text-amber-600",
//     danger: "bg-red-500/10 text-red-600",
//   };

//   return (
//     <Card className="relative overflow-hidden">
//       <CardContent className="p-6">
//         <div className="flex items-start justify-between">
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-muted-foreground">{title}</p>
//             <p className="text-3xl font-bold">{value}</p>
//             {description && (
//               <p className="text-xs text-muted-foreground">{description}</p>
//             )}
//             {trend && (
//               <div
//                 className={`flex items-center gap-1 text-xs ${
//                   trend.type === "up" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {trend.type === "up" ? (
//                   <TrendingUp className="h-3 w-3" />
//                 ) : (
//                   <TrendingDown className="h-3 w-3" />
//                 )}
//                 <span>{trend.value}</span>
//               </div>
//             )}
//           </div>
//           <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
//             <Icon className="h-6 w-6" />
//           </div>
//         </div>
//       </CardContent>
//       <div
//         className={`absolute bottom-0 left-0 right-0 h-1 ${
//           color === "primary"
//             ? "bg-primary"
//             : color === "success"
//             ? "bg-green-500"
//             : color === "warning"
//             ? "bg-amber-500"
//             : "bg-red-500"
//         }`}
//       />
//     </Card>
//   );
// }

// function QuickActionButton({ href, icon: Icon, label, color }) {
//   return (
//     <Button
//       variant="outline"
//       className="h-auto py-4 flex flex-col gap-2 bg-transparent hover:bg-muted/50 transition-all"
//       asChild
//     >
//       <Link href={href}>
//         <div className={`p-2 rounded-lg ${color}`}>
//           <Icon className="h-5 w-5" />
//         </div>
//         <span className="text-xs font-medium">{label}</span>
//       </Link>
//     </Button>
//   );
// }

// export function DashboardContent() {
//   const {
//     data: apiStats,
//     isLoading,
//     error,
//   } = useSWR("/api/dashboard/stats", fetcher, { refreshInterval: 30000 });
//   const stats = apiStats || undefined;

//   const { data: weeklyAttendance } = useSWR(
//     "/api/dashboard/weekly-attendance",
//     fetcher
//   );

//   const weeklyData =
//     weeklyAttendance && weeklyAttendance.length
//       ? weeklyAttendance
//       : [
//           { day: "Mon", present: 0, absent: 0 },
//           { day: "Tue", present: 0, absent: 0 },
//           { day: "Wed", present: 0, absent: 0 },
//           { day: "Thu", present: 0, absent: 0 },
//           { day: "Fri", present: 0, absent: 0 },
//         ];
//   const totalPresent = weeklyData.reduce((a, b) => a + b.present, 0);
//   const totalAbsent = weeklyData.reduce((a, b) => a + b.absent, 0);
//   const attendanceRate = totalPresent
//     ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
//     : 0;

//  const { data: monthlyFeeTrend } = useSWR(
//    "/api/dashboard/monthly-fee-trend?academicYear=2024-25",
//    fetcher
//  );

//  console.log(monthlyFeeTrend);
//  const feeTrendData =
//    monthlyFeeTrend && monthlyFeeTrend.length
//      ? monthlyFeeTrend
//      : [
//          { month: "Jan", collected: 0, pending: 0 },
//          { month: "Feb", collected: 0, pending: 0 },
//          { month: "Mar", collected: 0, pending: 0 },
//          { month: "Apr", collected: 0, pending: 0 },
//        ];

//   // const recentActivities = stats?.recentActivities ?? [
//   //   {
//   //     type: "admission",
//   //     text: "Dashboard connected successfully",
//   //     time: "Just now",
//   //     icon: CheckCircle2,
//   //   },
//   // ];

//   const recentActivities =
//     stats?.recentActivities?.map((a) => ({
//       ...a,
//       time: formatDistanceToNow(new Date(a.time), { addSuffix: true }),
//       icon:
//         a.type === "admission"
//           ? UserPlus
//           : a.type === "fee"
//           ? Wallet
//           : a.type === "attendance"
//           ? CalendarCheck
//           : CheckCircle2,
//     })) ?? [];

//   const classData =
//     stats?.classWiseStudents?.map((cls) => ({
//       name: `Class ${cls._id}`,
//       students: cls.count,
//     })) ?? [];

//   console.log(stats);

//   const feeData = [
//     { name: "Collected", value: stats?.fees?.collected || 0 },
//     { name: "Pending", value: stats?.fees?.pending || 0 },
//   ];

//   const attendanceData = [
//     { name: "Present", value: stats?.attendance?.present || 1160 },
//     { name: "Absent", value: stats?.attendance?.absent || 74 },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Dashboard"
//         description="Welcome back! Here's an overview of your school today."
//       >
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" asChild>
//             <Link href="/reports">
//               <BarChart3 className="h-4 w-4 mr-2" />
//               Reports
//             </Link>
//           </Button>
//           <Button size="sm" asChild>
//             <Link href="/students/add">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Student
//             </Link>
//           </Button>
//         </div>
//       </PageHeader>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Total Students"
//           value={stats?.students?.active ?? 0}
//           description={`${stats?.students?.total ?? 0} total students`}
//           icon={GraduationCap}
//           color="primary"
//         />

//         <StatCard
//           title="Total Teachers"
//           value={stats?.teachers?.active ?? 0}
//           description={`${stats?.teachers?.total ?? 0} total staff`}
//           icon={Users}
//           color="success"
//         />

//         {/* <StatCard
//           title="Fee Collection"
//           value={`Rs. ${(stats?.fees?.collected )}`}
//           description={`Rs. ${(stats?.fees?.pending)} pending`}
//           icon={DollarSign}
//           color="warning"
//         /> */}

//         <StatCard
//           title="Today's Attendance"
//           value={`${stats?.attendance?.percentage ?? 0}%`}
//           description={`${stats?.attendance?.present ?? 0} present`}
//           icon={UserCheck}
//           color={stats?.attendance?.percentage >= 90 ? "success" : "danger"}
//         />

//         <StatCard
//           title="Weekly Attendance"
//           value={`${attendanceRate}%`}
//           description="Last 7 days"
//           icon={TrendingUp}
//         />
//       </div>

//       {/* Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Weekly Attendance Trend */}
//         <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg">Weekly Attendance</CardTitle>
//                 <CardDescription>
//                   Student attendance trend this week
//                 </CardDescription>
//               </div>
//               <Badge variant="secondary" className="font-normal">
//                 <Activity className="h-3 w-3 mr-1" />
//                 Live
//               </Badge>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[280px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={weeklyAttendance}>
//                   <defs>
//                     <linearGradient
//                       id="presentGradient"
//                       x1="0"
//                       y1="0"
//                       x2="0"
//                       y2="1"
//                     >
//                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                       <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     className="stroke-border"
//                     vertical={false}
//                   />
//                   <XAxis
//                     dataKey="day"
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                       boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
//                     }}
//                     formatter={(value, name) => [
//                       value,
//                       name === "present" ? "Present" : "Absent",
//                     ]}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="present"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     fill="url(#presentGradient)"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="absent"
//                     stroke="#ef4444"
//                     strokeWidth={2}
//                     dot={{ fill: "#ef4444", r: 4 }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg">Recent Admissions</CardTitle>
//                 <CardDescription>Latest student enrollments</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/students/admissions">View All</Link>
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {(stats?.recentAdmissions || undefined.recentAdmissions)
//                 ?.slice(0, 5)
//                 .map((student, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage
//                           src={`/diverse-students-studying.png?height=40&width=40&query=student ${student.name}`}
//                         />
//                         <AvatarFallback className="bg-primary/10 text-primary font-medium">
//                           {student.name
//                             ?.split(" ")
//                             .map((n) => n[0])
//                             .join("")}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="font-medium text-sm">{student.name}</p>
//                         <p className="text-xs text-muted-foreground">
//                           Class {student.class} - Section {student.section}
//                         </p>
//                       </div>
//                     </div>
//                     <Badge variant="secondary" className="text-xs">
//                       {new Date(student.createdAt).toLocaleDateString()}
//                     </Badge>
//                   </div>
//                 ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Fee Collection Trend */}
//         {/* <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg">Fee Collection</CardTitle>
//                 <CardDescription>Monthly fee collection trend</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/fees/reports">View Details</Link>
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[280px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={feeTrendData}>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     className="stroke-border"
//                     vertical={false}
//                   />
//                   <XAxis
//                     dataKey="month"
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                     }}
//                     formatter={(value) => [`Rs. ${value.toLocaleString()}`, ""]}
//                   />
//                   <Bar
//                     dataKey="collected"
//                     fill="#3b82f6"
//                     radius={[4, 4, 0, 0]}
//                     name="Collected"
//                   />
//                   <Bar
//                     dataKey="pending"
//                     fill="#f59e0b"
//                     radius={[4, 4, 0, 0]}
//                     name="Pending"
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card> */}
//       </div>

//       {/* Bottom Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Class-wise Distribution */}
//         <Card className="lg:col-span-2">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Students by Class</CardTitle>
//             <CardDescription>Distribution across classes</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[240px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={classData} layout="vertical">
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     className="stroke-border"
//                     horizontal={false}
//                   />
//                   <XAxis
//                     type="number"
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     dataKey="name"
//                     type="category"
//                     className="text-xs"
//                     axisLine={false}
//                     tickLine={false}
//                     width={60}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                     }}
//                   />
//                   <Bar
//                     dataKey="students"
//                     fill="#3b82f6"
//                     radius={[0, 4, 4, 0]}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Activities */}
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg">Recent Activities</CardTitle>
//                 <CardDescription>
//                   Latest updates from your school
//                 </CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/notifications">
//                   View All
//                   <ArrowRight className="h-4 w-4 ml-1" />
//                 </Link>
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentActivities.map((activity, index) => (
//                 <div key={index} className="flex items-start gap-3">
//                   <div
//                     className={`p-2 rounded-lg flex-shrink-0 ${
//                       activity.type === "admission"
//                         ? "bg-blue-500/10 text-blue-600"
//                         : activity.type === "fee"
//                           ? "bg-green-500/10 text-green-600"
//                           : activity.type === "attendance"
//                             ? "bg-purple-500/10 text-purple-600"
//                             : activity.type === "exam"
//                               ? "bg-amber-500/10 text-amber-600"
//                               : "bg-primary/10 text-primary"
//                     }`}
//                   >
//                     <activity.icon className="h-4 w-4" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-foreground">{activity.text}</p>
//                     <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
//                       <Clock className="h-3 w-3" />
//                       {activity.time}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-lg">Quick Actions</CardTitle>
//           <CardDescription>Common tasks and shortcuts</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
//             <QuickActionButton
//               href="/students/add"
//               icon={GraduationCap}
//               label="Add Student"
//               color="bg-blue-500/10 text-blue-600"
//             />
//             <QuickActionButton
//               href="/teachers/add"
//               icon={Users}
//               label="Add Teacher"
//               color="bg-green-500/10 text-green-600"
//             />
//             <QuickActionButton
//               href="/attendance/students"
//               icon={UserCheck}
//               label="Attendance"
//               color="bg-purple-500/10 text-purple-600"
//             />
//             <QuickActionButton
//               href="/fees"
//               icon={DollarSign}
//               label="Collect Fee"
//               color="bg-amber-500/10 text-amber-600"
//             />
//             <QuickActionButton
//               href="/exams"
//               icon={FileText}
//               label="Exams"
//               color="bg-red-500/10 text-red-600"
//             />
//             <QuickActionButton
//               href="/quizzes/create"
//               icon={BookOpen}
//               label="Create Quiz"
//               color="bg-cyan-500/10 text-cyan-600"
//             />
//             <QuickActionButton
//               href="/ai/papers"
//               icon={Brain}
//               label="AI Papers"
//               color="bg-pink-500/10 text-pink-600"
//             />
//             <QuickActionButton
//               href="/downloads/students"
//               icon={Download}
//               label="Downloads"
//               color="bg-indigo-500/10 text-indigo-600"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Admissions & Fee Summary */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Admissions */}

//         {/* Fee Summary */}
//         {/* <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg">Fee Summary</CardTitle>
//                 <CardDescription>Collection overview</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/fees/reports">View Report</Link>
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center gap-6">
//               <div className="w-[160px] h-[160px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={feeData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={45}
//                       outerRadius={70}
//                       paddingAngle={3}
//                       dataKey="value"
//                     >
//                       {feeData.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={index === 0 ? "#10b981" : "#f59e0b"}
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip
//                       formatter={(value) => `Rs. ${value.toLocaleString()}`}
//                       contentStyle={{
//                         backgroundColor: "hsl(var(--card))",
//                         border: "1px solid hsl(var(--border))",
//                         borderRadius: "8px",
//                       }}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="flex-1 space-y-4">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <div className="w-3 h-3 rounded-full bg-green-500" />
//                     <span className="text-sm font-medium">Collected</span>
//                   </div>
//                   <p className="text-2xl font-bold text-green-600">
//                     Rs.{" "}
//                     {((stats?.fees?.collected || 0) )}
//                   </p>
//                   <Progress value={85} className="h-2 mt-2" />
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <div className="w-3 h-3 rounded-full bg-amber-500" />
//                     <span className="text-sm font-medium">Pending</span>
//                   </div>
//                   <p className="text-2xl font-bold text-amber-600">
//                     Rs. {((stats?.fees?.pending || 0) )}

//                   </p>
//                   <Progress
//                     value={15}
//                     className="h-2 mt-2 [&>div]:bg-amber-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card> */}
//       </div>
//     </div>
//   );
// }

// // Missing import
// import { BarChart3, Brain, Download } from "lucide-react";

"use client";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users,
  GraduationCap,
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
  CalendarCheck,
  UserPlus,
  BarChart3,
  Brain,
  Download,
  Award,
  BookMarked,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
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
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import ResultEntryBoard from "./ResultEntryBoard";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Result-specific colors
const RESULT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
    info: "bg-blue-500/10 text-blue-600",
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground font-medium">
                {description}
              </p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${colorClasses[color]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1.5 opacity-20 ${
          color === "primary"
            ? "bg-primary"
            : color === "success"
              ? "bg-green-500"
              : color === "warning"
                ? "bg-amber-500"
                : "bg-red-500"
        }`}
      />
    </Card>
  );
}

function QuickActionButton({ href, icon: Icon, label, color }) {
  return (
    <Button
      variant="outline"
      className="h-auto py-5 flex flex-col gap-3 bg-white hover:border-primary transition-all rounded-2xl border-slate-100 shadow-sm"
      asChild
    >
      <Link href={href}>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
      </Link>
    </Button>
  );
}

export function DashboardContent() {
  const { data: stats, isLoading } = useSWR("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000,
  });
  const { data: weeklyAttendance } = useSWR(
    "/api/dashboard/weekly-attendance",
    fetcher,
  );

  // Mock Result Data for Gov School context
  const academicPerformance = [
    { grade: "A+", students: 45 },
    { grade: "A", students: 120 },
    { grade: "B", students: 85 },
    { grade: "C", students: 30 },
  ];

  const classPerformanceData = [
    { class: "6", passPercentage: 88 },
    { class: "7", passPercentage: 92 },
    { class: "8", passPercentage: 75 },
    { class: "9", passPercentage: 82 },
    { class: "10", passPercentage: 95 },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="School Command Center"
        description="Academic session 2026 • Monitoring and performance overview."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold" asChild>
            <Link href="/reports">
              <BarChart3 className="h-4 w-4 mr-2" /> Annual Reports
            </Link>
          </Button>
          <Button
            className="rounded-xl font-bold shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/students/add">
              <Plus className="h-4 w-4 mr-2" /> New Enrollment
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Students"
          value={stats?.students?.active ?? 0}
          description="Total registered in portal"
          icon={GraduationCap}
          color="primary"
        />
        <StatCard
          title="Staff Strength"
          value={stats?.teachers?.active ?? 0}
          description="Teaching & Admin staff"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Average Result"
          value="84%"
          description="Based on Mid-Term '26"
          icon={Award}
          color="warning"
        />
        <StatCard
          title="Daily Presence"
          value={`${stats?.attendance?.percentage ?? 0}%`}
          description={`${stats?.attendance?.present ?? 0} students present`}
          icon={ShieldCheck}
          color="info"
        />
      </div>

      {/* <ResultEntryBoard /> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">
                  Attendance Analytics
                </CardTitle>
                <CardDescription>
                  Visualizing student stability this week
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold px-3 py-1">
                LIVE FEED
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient
                      id="attGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-black">
              Grade Distribution
            </CardTitle>
            <CardDescription>Last Exam Performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={academicPerformance}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="students"
                  >
                    {academicPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RESULT_COLORS[index % RESULT_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {academicPerformance.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RESULT_COLORS[i] }}
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {item.grade}: {item.students}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Progress by Class */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-black">
              Class-wise Pass Rate
            </CardTitle>
            <CardDescription>
              Academic success percentage per grade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="class"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Grade",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "12px" }}
                  />
                  <Bar
                    dataKey="passPercentage"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        <Card className="border-none shadow-sm bg-white/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">New Students</CardTitle>
              <CardDescription>Recent enrollments</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.recentAdmissions?.slice(0, 4).map((student, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold uppercase">
                      {student.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">
                      Grade {student.class}-{student.section}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-lg text-[10px] font-bold border-slate-200"
                  >
                    {new Date(student.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
          <Activity size={180} />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-black">
            School Operations
          </CardTitle>
          <CardDescription className="text-slate-400">
            Common administrative shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionButton
              href="/students/add"
              icon={GraduationCap}
              label="Enrollment"
              color="bg-blue-500 text-white"
            />
            <QuickActionButton
              href="/teachers/add"
              icon={Users}
              label="Staff Registry"
              color="bg-emerald-500 text-white"
            />
            <QuickActionButton
              href="/attendance/students"
              icon={UserCheck}
              label="Daily Roll Call"
              color="bg-purple-500 text-white"
            />
            <QuickActionButton
              href="/exams"
              icon={FileText}
              label="Exams Board"
              color="bg-rose-500 text-white"
            />
            <QuickActionButton
              href="/quizzes/create"
              icon={BookMarked}
              label="Assign Test"
              color="bg-amber-500 text-white"
            />
            <QuickActionButton
              href="/ai/papers"
              icon={Brain}
              label="AI Question Bank"
              color="bg-indigo-500 text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}