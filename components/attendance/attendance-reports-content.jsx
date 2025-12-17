"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { Download, FileText, Calendar, Users, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useClasses } from "../hooks/useClasses";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function AttendanceReportsContent() {
  // filters
  const [reportType, setReportType] = useState("monthly");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // pagination for low attendance table
  const [lowPage, setLowPage] = useState(1);
  const [lowPerPage, setLowPerPage] = useState(5);

  // data
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const { classes } = useClasses();
  const selectedClass = useMemo(
    () => classes.find((c) => c._id === classId),
    [classes, classId]
  );

  const selectedSection = useMemo(
    () => selectedClass?.sections.find((s) => s.name === sectionId),
    [selectedClass, sectionId]
  );
  // fetch attendance from API when filters change
  useEffect(() => {
    fetchAttendance();
  }, [classId, sectionId, dateRange, reportType]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      params.set("type", "Student");

      if (classId) params.set("classId", classId);
      if (sectionId) params.set("sectionId", sectionId);

      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to) params.set("to", dateRange.to);

      const res = await fetch(`/api/attendance?${params.toString()}`);
      const json = await res.json();

      setAttendanceData(Array.isArray(json) ? json : json.attendance || []);
    } catch (err) {
      console.error(err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
      setLowPage(1);
    }
  }

  // ---------- Transformations for charts & stats ----------

  // monthly aggregation (month short name -> averaged percent)
  const monthlyMap = useMemo(() => {
    const map = {};
    attendanceData.forEach((a) => {
      const month = new Date(a.date).toLocaleString("en", { month: "short" });
      if (!map[month]) map[month] = { month, sum: 0, count: 0 };
      const total = a.records?.length || 0;
      const present = (a.records || []).filter(
        (r) => r.status === "Present"
      ).length;
      const percent = total ? (present / total) * 100 : 0;
      map[month].sum += percent;
      map[month].count += 1;
    });
    return map;
  }, [attendanceData]);

  const monthlyChart = useMemo(() => {
    return Object.values(monthlyMap).map((m) => ({
      month: m.month,
      attendance: Number((m.sum / m.count).toFixed(1)),
    }));
  }, [monthlyMap]);

  // class wise
  const classMap = useMemo(() => {
    const map = {};
    attendanceData.forEach((a) => {
      const cls = a.class || "Unknown";
      if (!map[cls]) map[cls] = { cls, sum: 0, count: 0 };
      const total = a.records?.length || 0;
      const present = (a.records || []).filter(
        (r) => r.status === "Present"
      ).length;
      const percent = total ? (present / total) * 100 : 0;
      map[cls].sum += percent;
      map[cls].count += 1;
    });
    return map;
  }, [attendanceData]);

  const classWiseData = useMemo(() => {
    return Object.values(classMap).map((c) => ({
      class: c.cls,
      percentage: Number((c.sum / c.count || 0).toFixed(1)),
    }));
  }, [classMap]);

  // compute low attendance students (aggregated by student across attendanceData)
  const lowAttendanceMap = useMemo(() => {
    const map = {};

    attendanceData.forEach((a) => {
      const className =
        classes.find((c) => c._id === a.classId)?.name || a.class || "Unknown";

      (a.records || []).forEach((r) => {
        const id = r.studentId || r.rollNumber || r.name;

        if (!map[id]) {
          map[id] = {
            rollNumber: r.rollNumber || "-",
            name: r.name || "-",
            className,
            present: 0,
            total: 0,
          };
        }

        map[id].total += 1;
        if (r.status === "Present") map[id].present += 1;
      });
    });

    return Object.values(map).map((s) => ({
      ...s,
      percentage: s.total
        ? Number(((s.present / s.total) * 100).toFixed(1))
        : 0,
      absents: s.total - s.present,
    }));
  }, [attendanceData, classes]);

  // pagination for low attendance
  const lowTotal = lowAttendanceMap.length;
  const lowPages = Math.max(1, Math.ceil(lowTotal / lowPerPage));
  const lowVisible = lowAttendanceMap.slice(
    (lowPage - 1) * lowPerPage,
    lowPage * lowPerPage
  );

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const totalStudentsSet = new Set();
    let presentToday = 0;
    let absentToday = 0;
    let sumPercent = 0;
    let countPercent = 0;

    attendanceData.forEach((a) => {
      (a.records || []).forEach((r) => {
        totalStudentsSet.add(r.studentId || r.rollNumber || r.name);
      });
      const total = a.records?.length || 0;
      const present = (a.records || []).filter(
        (r) => r.status === "Present"
      ).length;
      presentToday += present;
      absentToday += total - present;
      if (total) {
        const percent = (present / total) * 100;
        sumPercent += percent;
        countPercent++;
      }
    });

    const avgAttendance = countPercent
      ? Number((sumPercent / countPercent).toFixed(1))
      : 0;

    // highest / lowest class
    const classPercentList = Object.values(classMap).map((c) => ({
      cls: c.cls,
      avg: Number((c.sum / c.count || 0).toFixed(1)),
    }));
    classPercentList.sort((a, b) => b.avg - a.avg);
    const highestClass = classPercentList[0]
      ? `${classPercentList[0].cls} (${classPercentList[0].avg}%)`
      : "-";
    const lowestClass = classPercentList[classPercentList.length - 1]
      ? `${classPercentList[classPercentList.length - 1].cls} (${
          classPercentList[classPercentList.length - 1].avg
        }%)`
      : "-";

    return {
      totalStudents: totalStudentsSet.size,
      presentToday,
      absentToday,
      avgAttendance,
      highestClass,
      lowestClass,
    };
  }, [attendanceData, classMap]);

  // ---------- EXPORT HELPERS ----------
  function exportToCSV(rows = [], filename = "attendance.csv") {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(",")]
      .concat(
        rows.map((r) =>
          keys
            .map((k) => JSON.stringify(r[k] ?? "").replace(/""/g, '"'))
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  }

  async function exportToExcel(rows = [], filename = "attendance.xlsx") {
    try {
      // try dynamic import of xlsx
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, filename);
    } catch (err) {
      // fallback to CSV
      exportToCSV(rows, filename.replace(/\.xlsx?$/, ".csv"));
    }
  }

  function exportReportPDF() {
    // simple client-side printable window (works without server pdf libs)
    const docHtml = buildReportHtml(attendanceData, {
      stats,
      monthlyChart,
      classWiseData,
      lowAttendanceMap,
    });
    const w = window.open("", "_blank", "noopener,width=900,height=700");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><title>Attendance Report</title><meta charset='utf-8' /><meta name='viewport' content='width=device-width,initial-scale=1' /><style>body{font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;}table{border-collapse:collapse;width:100%;}th,td{padding:6px 8px;border:1px solid #ddd;text-align:left;font-size:12px;}h1,h2,h3{margin:4px 0;}@media print {button{display:none}}</style></head><body>${docHtml}<script>window.onload=()=>{setTimeout(()=>{window.print();},300)}</script></body></html>`
    );
    w.document.close();
  }

  function buildReportHtml(att, extras) {
    const { stats, monthlyChart, classWiseData, lowAttendanceMap } =
      extras || {};
    const rows = (lowAttendanceMap || []).slice(0, 100);
    return `
      <div style="padding:18px;max-width:900px;margin:0 auto;">
        <h1 style="text-align:center;margin-bottom:6px">Attendance Report</h1>
        <p style="text-align:center;margin-top:0;color:#555">Generated: ${new Date().toLocaleString()}</p>

        <h3>Summary</h3>
        <table style="margin-bottom:12px;">
          <tr><th>Total Students</th><td>${
            stats?.totalStudents ?? 0
          }</td><th>Average Attendance</th><td>${
      stats?.avgAttendance ?? 0
    }%</td></tr>
          <tr><th>Present (filtered)</th><td>${
            stats?.presentToday ?? 0
          }</td><th>Absent (filtered)</th><td>${
      stats?.absentToday ?? 0
    }</td></tr>
          <tr><th>Highest Class</th><td colspan="3">${
            stats?.highestClass ?? "-"
          }</td></tr>
        </table>

        <h3>Low Attendance Students (sample)</h3>
        <table>
          <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>%</th><th>Absents</th></tr></thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr><td>${r.rollNumber || "-"}</td><td>${
                    r.name || "-"
                  }</td><td>${r.class || "-"}</td><td>${
                    r.percentage
                  }%</td><td>${r.absents}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // prepare dataset for export (flattened)
  const exportRows = useMemo(() => {
    const rows = [];
    attendanceData.forEach((a) => {
      (a.records || []).forEach((r) => {
        rows.push({
          date: a.date,
          class: a.class,
          section: a.section,
          rollNumber: r.rollNumber,
          name: r.name,
          status: r.status,
        });
      });
    });
    return rows;
  }, [attendanceData]);

  // pie chart data for present vs absent (last filtered set)
  const pieData = useMemo(() => {
    let present = 0;
    let absent = 0;
    attendanceData.forEach((a) => {
      present += (a.records || []).filter((r) => r.status === "Present").length;
      absent += (a.records || []).filter((r) => r.status !== "Present").length;
    });
    return [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
    ];
  }, [attendanceData]);

  const COLORS = ["#10B981", "#EF4444"];
  console.log("attendanceData", attendanceData);
  console.log("lowAttendanceMap", lowAttendanceMap);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description="Analyze attendance patterns and generate reports"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              exportToExcel(
                exportRows,
                `attendance_${new Date().toISOString().slice(0, 10)}.xlsx`
              )
            }
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" /> Export Excel
          </Button>

          <Button
            onClick={() =>
              exportToCSV(
                exportRows,
                `attendance_${new Date().toISOString().slice(0, 10)}.csv`
              )
            }
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>

          <Button onClick={exportReportPDF}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Present (filtered)</p>
            <p className="text-2xl font-bold">{stats.presentToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Absent (filtered)</p>
            <p className="text-2xl font-bold">{stats.absentToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Average Attendance</p>
            <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Highest Class</p>
            <p className="text-2xl font-bold">{stats.highestClass}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Lowest Class</p>
            <p className="text-2xl font-bold">{stats.lowestClass}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Class</Label>
              <Select
                value={classId}
                onValueChange={(val) => {
                  setClassId(val);
                  setSectionId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((d) => ({ ...d, from: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((d) => ({ ...d, to: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Average % by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-wise</CardTitle>
            <CardDescription>Average by class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Present vs Absent</CardTitle>
            <CardDescription>Filtered total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low attendance table + pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Students with Low Attendance</CardTitle>
          <CardDescription>Students below 75%</CardDescription>
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
              {lowVisible.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.rollNumber}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Number(s.percentage)}
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium">
                        {s.percentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{s.absents} days</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.percentage < 60 ? "destructive" : "warning"}
                    >
                      {s.percentage < 60 ? "Critical" : "Warning"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {lowPage} of {lowPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={lowPage <= 1}
                onClick={() => setLowPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                disabled={lowPage >= lowPages}
                onClick={() => setLowPage((p) => Math.min(lowPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
