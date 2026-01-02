// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { PageHeader } from "@/components/ui/page-header"
// import { Download, FileText, TrendingUp, DollarSign, Calendar, PieChart } from "lucide-react"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts"

// const monthlyCollection = [
//   { month: "Jan", collected: 2100000, pending: 400000 },
//   { month: "Feb", collected: 2300000, pending: 350000 },
//   { month: "Mar", collected: 2400000, pending: 300000 },
//   { month: "Apr", collected: 2200000, pending: 450000 },
//   { month: "May", collected: 2500000, pending: 280000 },
//   { month: "Jun", collected: 2600000, pending: 320000 },
//   { month: "Jul", collected: 2100000, pending: 500000 },
//   { month: "Aug", collected: 2400000, pending: 380000 },
//   { month: "Sep", collected: 2550000, pending: 350000 },
//   { month: "Oct", collected: 2300000, pending: 420000 },
//   { month: "Nov", collected: 2650000, pending: 300000 },
//   { month: "Dec", collected: 2500000, pending: 450000 },
// ]

// const classWiseCollection = [
//   { class: "Class 1", collected: 1450000, pending: 120000 },
//   { class: "Class 2", collected: 1500000, pending: 150000 },
//   { class: "Class 3", collected: 1550000, pending: 180000 },
//   { class: "Class 4", collected: 1600000, pending: 200000 },
//   { class: "Class 5", collected: 1650000, pending: 220000 },
//   { class: "Class 6", collected: 1820000, pending: 250000 },
//   { class: "Class 7", collected: 1870000, pending: 280000 },
//   { class: "Class 8", collected: 1920000, pending: 320000 },
//   { class: "Class 9", collected: 2050000, pending: 350000 },
//   { class: "Class 10", collected: 2100000, pending: 400000 },
// ]

// const paymentMethods = [
//   { name: "Cash", value: 45 },
//   { name: "Bank Transfer", value: 30 },
//   { name: "Online", value: 15 },
//   { name: "Card", value: 8 },
//   { name: "Cheque", value: 2 },
// ]

// const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

// export function FeeReportsContent() {
//   const [reportType, setReportType] = useState("monthly")
//   const [year, setYear] = useState("2024")
//   const [month, setMonth] = useState("all")

//   const totalCollected = monthlyCollection.reduce((sum, m) => sum + m.collected, 0)
//   const totalPending = monthlyCollection.reduce((sum, m) => sum + m.pending, 0)

//   return (
//     <div className="space-y-6">
//       <PageHeader title="Fee Reports" description="Analyze fee collection and generate reports">
//         <Button>
//           <Download className="h-4 w-4 mr-2" />
//           Export Report
//         </Button>
//       </PageHeader>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//             <div className="space-y-1.5">
//               <Label>Report Type</Label>
//               <Select value={reportType} onValueChange={setReportType}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="monthly">Monthly Report</SelectItem>
//                   <SelectItem value="quarterly">Quarterly Report</SelectItem>
//                   <SelectItem value="yearly">Yearly Report</SelectItem>
//                   <SelectItem value="classwise">Class-wise Report</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Year</Label>
//               <Select value={year} onValueChange={setYear}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="2024">2024</SelectItem>
//                   <SelectItem value="2023">2023</SelectItem>
//                   <SelectItem value="2022">2022</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Month</Label>
//               <Select value={month} onValueChange={setMonth}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Months</SelectItem>
//                   {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
//                     <SelectItem key={m} value={m.toLowerCase()}>
//                       {m}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>&nbsp;</Label>
//               <Button className="w-full">
//                 <FileText className="h-4 w-4 mr-2" />
//                 Generate PDF
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="p-3 rounded-full bg-green-500/10">
//               <DollarSign className="h-6 w-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Total Collected</p>
//               <p className="text-xl font-bold text-green-600">Rs. {(totalCollected / 100000).toFixed(1)}L</p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="p-3 rounded-full bg-amber-500/10">
//               <TrendingUp className="h-6 w-6 text-amber-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Total Pending</p>
//               <p className="text-xl font-bold text-amber-600">Rs. {(totalPending / 100000).toFixed(1)}L</p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="p-3 rounded-full bg-primary/10">
//               <PieChart className="h-6 w-6 text-primary" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Collection Rate</p>
//               <p className="text-xl font-bold text-primary">
//                 {((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="p-3 rounded-full bg-purple-500/10">
//               <Calendar className="h-6 w-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Avg Monthly</p>
//               <p className="text-xl font-bold text-purple-600">Rs. {(totalCollected / 12 / 100000).toFixed(1)}L</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Collection Trend</CardTitle>
//             <CardDescription>Fee collection vs pending for {year}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[350px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={monthlyCollection}>
//                   <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                   <XAxis dataKey="month" className="text-xs" />
//                   <YAxis className="text-xs" tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                     }}
//                     formatter={(value) => `Rs. ${value.toLocaleString()}`}
//                   />
//                   <Legend />
//                   <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
//                   <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Payment Methods</CardTitle>
//             <CardDescription>Distribution of payment methods used</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[350px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <RechartsPieChart>
//                   <Pie
//                     data={paymentMethods}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={80}
//                     outerRadius={120}
//                     paddingAngle={3}
//                     dataKey="value"
//                     label={({ name, value }) => `${name}: ${value}%`}
//                   >
//                     {paymentMethods.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => `${value}%`} />
//                 </RechartsPieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Class-wise Collection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Class-wise Fee Collection</CardTitle>
//           <CardDescription>Fee collection breakdown by class</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={classWiseCollection} layout="vertical">
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                 <XAxis type="number" className="text-xs" tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
//                 <YAxis dataKey="class" type="category" className="text-xs" width={70} />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     borderRadius: "8px",
//                   }}
//                   formatter={(value) => `Rs. ${value.toLocaleString()}`}
//                 />
//                 <Legend />
//                 <Bar dataKey="collected" name="Collected" fill="#3b82f6" radius={[0, 4, 4, 0]} />
//                 <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[0, 4, 4, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  PieChart,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as Pie,
  Pie as PieArc,
  Cell,
  Legend,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());
const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"];

export function FeeReportsContent() {
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [month, setMonth] = useState("all");

  const { data, isLoading } = useSWR(
    `/api/fees/reports/fees?academicYear=${academicYear}&month=${month}`,
    fetcher
  );

  const totals = data?.totals || { totalCollected: 0, totalPending: 0 };

  const collectionRate = useMemo(() => {
    const total = totals.totalCollected + totals.totalPending;
    return total ? ((totals.totalCollected / total) * 100).toFixed(1) : 0;
  }, [totals]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Reports"
        description="Enterprise-level financial analytics"
      >
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/fees/reports/pdf?academicYear=${academicYear}`,
              "_blank"
            )
          }
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </PageHeader>

      {/* FILTERS */}
      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div>
            <Label>Academic Year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          title="Collected"
          value={totals.totalCollected}
          icon={DollarSign}
        />
        <Stat title="Pending" value={totals.totalPending} icon={TrendingUp} />
        <Stat
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon={PieChart}
        />
        <Stat
          title="Avg Monthly"
          value={Math.round(totals.totalCollected / 12)}
          icon={Calendar}
        />
      </div>

      {/* CHARTS */}
      {isLoading || !data ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <>
          <Chart title="Monthly Collection">
            <MonthlyChart data={data.monthly || []} />
          </Chart>

          <Chart title="Payment Methods">
            <PaymentChart data={data.paymentMethods || []} />
          </Chart>

          <Chart title="Class-wise Collection">
            <ClassChart data={data.classWise || []} />
          </Chart>
        </>
      )}
    </div>
  );
}

/* ================== SMALL COMPONENTS ================== */

function Stat({ title, value, icon: Icon, prefix = "Rs.", suffix = "" }) {
  const isNumber = typeof value === "number" && !isNaN(value);

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">
            {isNumber ? `${prefix} ${value.toLocaleString()}${suffix}` : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Chart({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ================== CHART VIEWS ================== */

function MonthlyChart({ data }) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
      <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
      <Legend />
      <Bar dataKey="collected" fill="#16a34a" />
      <Bar dataKey="pending" fill="#f59e0b" />
    </BarChart>
  );
}

function PaymentChart({ data }) {
  return (
    <Pie>
      <PieArc data={data} dataKey="value" nameKey="name" outerRadius={110}>
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </PieArc>
      <Tooltip />
      <Legend />
    </Pie>
  );
}

function ClassChart({ data }) {
  return (
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="class" type="category" />
      <Tooltip />
      <Legend />
      <Bar dataKey="collected" fill="#2563eb" />
      <Bar dataKey="pending" fill="#dc2626" />
    </BarChart>
  );
}
