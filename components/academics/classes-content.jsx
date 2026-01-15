// "use client";

// import { useEffect, useMemo, useState } from "react";
// import useSWR from "swr";
// import { useForm, useFieldArray, Controller } from "react-hook-form";
// import { saveAs } from "file-saver";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableHead,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { EmptyState } from "@/components/ui/empty-state";
// import { Plus, Edit, Trash2, Download, FileText } from "lucide-react";
// import { toast } from "sonner";
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   BarChart,
//   XAxis,
//   Bar,
// } from "recharts";
// import ClassFormDialog from "./ClassFormDialog";

// const classes = [
//   //  {_id:"class-1", name:"Class 1"},
//   //  {_id:"class-2", name:"Class 2"},
//   //  {_id:"class-3", name:"Class 3"},
//   //  {_id:"class-4", name:"Class 4"},
//   //  {_id:"class-5", name:"Class 5"},
//   { _id: "class-6", name: "Class 6" },
//   { _id: "class-7", name: "Class 7" },
//   { _id: "class-8", name: "Class 8" },
//   { _id: "class-9", name: "Class 9" },
//   { _id: "class-10", name: "Class 10" },
//   //  {_id:"class-11", name:"Class 11"},
//   //  {_id:"class-12", name:"Class 12"},
// ];

// const fetcher = (url) => fetch(url).then((r) => r.json());

// const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#ef4444", "#a78bfa"];

// export function ClassesContent() {
//   // UI state
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [open, setOpen] = useState(false);
//   // Filters & independent pagination state (separate for list & export maybe)
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [sort, setSort] = useState("-createdAt");

//   const { data: analytics } = useSWR("/api/students/analytics", fetcher);
//   // SWR: paginated fetch for classes
//   const params = useMemo(() => {
//     const p = new URLSearchParams();
//     if (search) p.set("search", search);
//     p.set("page", String(page));
//     p.set("limit", String(limit));
//     p.set("sort", sort);
//     return p.toString();
//   }, [search, page, limit, sort]);

//   const { data, isLoading, mutate } = useSWR(
//     `/api/academics/classes?${params}`,
//     fetcher,
//     // { revalidateOnFocus: false }
//   );

//   const { data: teachersRes, isLoading: teachersLoading } = useSWR(
//     `/api/teachers?${params.toString()}`,
//     fetcher
//   );

//   console.log(data?.data);

//   const teachers = teachersRes?.teachers || [];
//   console.log(teachers);
//   const { data: subjectsRes, isLoading: subjectsLoading } = useSWR(
//     `/api/academics/subjects?${params.toString()}`,
//     fetcher
//   );
//   const subjects = subjectsRes?.subjects || [];
//   // RHF form
//   const { register, control, handleSubmit, reset, watch } = useForm({
//     defaultValues: {
//       name: "",
//       academicYear: "",
//       sections: [{ name: "A", capacity: 40, classTeacher: "" }],
//       subjects: [{ name: "", code: "", teacher: "", periods: 0 }],
//       feeStructure: {
//         tuitionFee: 0,
//         admissionFee: 0,
//         examFee: 0,
//         labFee: 0,
//         libraryFee: 0,
//         sportsFee: 0,
//         computerFee: 0,
//         otherFee: 0,
//       },
//       schedule: [],
//     },
//   });

//   const sectionsFieldArray = useFieldArray({ control, name: "sections" });
//   const subjectsFieldArray = useFieldArray({ control, name: "subjects" });

//   useEffect(() => {
//     // reset if closed
//     if (!isAddOpen) {
//       setSelectedClass(null);
//       reset();
//     }
//   }, [isAddOpen, reset]);

//   async function onSubmit(form) {
//     console.log("form", form);
//     try {
//       // Determine if adding or updating
//       const method = selectedClass ? "PUT" : "POST";
//       const url = "/api/academics/classes";
//       const payload = selectedClass
//         ? { _id: selectedClass._id, ...form }
//         : form;

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json();
//       if (!res.ok) throw new Error(json?.error || "Failed to save class");

//       toast.success(selectedClass ? "Class updated" : "Class added");
//       setIsAddOpen(false);
//       reset();
//       mutate(); // refresh SWR cache
//     } catch (err) {
//       toast.error(err.message || "Error saving class");
//     }
//   }

//   async function handleDelete(id) {
//     if (!confirm("Delete this class?")) return;
//     try {
//       const res = await fetch(`/api/academics/classes?id=${id}`, {
//         method: "DELETE",
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json?.error || "Delete failed");
//       toast.success("Deleted");
//       mutate();
//     } catch (err) {
//       toast.error(err.message || "Delete failed");
//     }
//   }

//  function handleEdit(cls) {
//    setSelectedClass(cls);

//    reset({
//      name: cls.name,
//      academicYear: cls.academicYear,

//      sections: cls.sections?.length
//        ? cls.sections.map((s) => ({
//            name: s.name,
//            capacity: s.capacity,
//            classTeacher: s.classTeacher?._id || s.classTeacher || "",
//          }))
//        : [{ name: "A", capacity: 40, classTeacher: "" }],

//      subjects: cls.subjects?.length
//        ? cls.subjects.map((s) => {
//            const meta = subjects.find(
//              (x) => x.name === s.name && x.code === s.code
//            );

//            return {
//              subjectId: meta?._id || "",
//              teacher: s.teacher?._id || s.teacher || "",
//              periods: s.periods,
//            };
//          })
//        : [{ subjectId: "", teacher: "", periods: 1 }],

//      feeStructure: cls.feeStructure || {},
//      schedule: cls.schedule || [],
//    });

//    setIsAddOpen(true);
//  }

//   // PDF export
//   async function exportPDF(all = false) {
//     try {
//       const p = new URLSearchParams();
//       if (search) p.set("search", search);
//       if (all) p.set("limit", "1000");
//       p.set("page", "1");
//       const res = await fetch(
//         `/api/academics/classes/export/pdf?${p.toString()}`
//       );
//       if (!res.ok) throw new Error("Export failed");
//       const blob = await res.blob();
//       saveAs(blob, `classes_${new Date().toISOString().slice(0, 10)}.pdf`);
//       toast.success("Download started");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   }

//   // CSV (Excel friendly)
//   async function exportCSV(all = false) {
//     try {
//       const p = new URLSearchParams();
//       if (search) p.set("search", search);
//       if (all) p.set("limit", "1000");
//       p.set("page", "1");
//       const res = await fetch(
//         `/api/academics/classes/export/csv?${p.toString()}`
//       );
//       if (!res.ok) throw new Error("Export failed");
//       const text = await res.text();
//       const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
//       saveAs(blob, `classes_${new Date().toISOString().slice(0, 10)}.csv`);
//       toast.success("Download started");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   }

//   // Teacher report (JSON download)
//   async function exportTeacherReport() {
//     try {
//       const res = await fetch(`/api/academics/classes/teacher-report`);
//       if (!res.ok) throw new Error("Report failed");
//       const blob = await res.blob();
//       saveAs(
//         blob,
//         `teacher_report_${new Date().toISOString().slice(0, 10)}.csv`
//       );
//       toast.success("Teacher report downloaded");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   }

//   // Attendance Pie Chart - fetch attendance summary for selected class (quick)
//   const [attendanceSummary, setAttendanceSummary] = useState([]);
//   async function loadAttendanceSummary(className) {
//     try {
//       if (!className) {
//         setAttendanceSummary([]);
//         return;
//       }
//       const res = await fetch(
//         `/api/attendance/summary?class=${encodeURIComponent(className)}`
//       );
//       if (!res.ok) throw new Error("Failed to load attendance summary");
//       const json = await res.json();
//       setAttendanceSummary(json.data || []);
//     } catch (err) {
//       console.error(err);
//       setAttendanceSummary([]);
//     }
//   }

//   // when selectedClass changes load attendance
//   useEffect(() => {
//     if (selectedClass?.name) loadAttendanceSummary(selectedClass.name);
//   }, [selectedClass]);

//   // UI render
//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Classes"
//         description="Manage classes, fee structure and schedule"
//       >
//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={() => exportCSV(true)}>
//             <FileText className="h-4 w-4 mr-2" /> Export CSV (All)
//           </Button>
//           <Button variant="outline" onClick={() => exportPDF(true)}>
//             <Download className="h-4 w-4 mr-2" /> Export PDF (All)
//           </Button>
//           <Button onClick={() => setIsAddOpen(true)}>
//             <Plus className="h-4 w-4 mr-2" /> Add Class
//           </Button>
//         </div>
//       </PageHeader>
//       {/* Filters + Pagination controls */}
//       <Card>
//         <CardContent className="flex flex-wrap gap-3 items-center">
//           <div className="flex-1 max-w-sm">
//             <Input
//               placeholder="Search classes..."
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//             />
//           </div>

//           <Select
//             value={String(limit)}
//             onValueChange={(v) => {
//               setLimit(Number(v));
//               setPage(1);
//               setSearch("");
//               reset();
//             }}
//           >
//             <SelectTrigger className="w-32">
//               <SelectValue>{limit} / page</SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               {[10, 25, 50, 100].map((n) => (
//                 <SelectItem key={n} value={String(n)}>
//                   {n} / page
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value="-createdAt"
//             onValueChange={(v) => {
//               setSort(v);
//               setPage(1);
//             }}
//           >
//             <SelectTrigger className="w-40">
//               <SelectValue>{sort}</SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="-createdAt">Newest</SelectItem>
//               <SelectItem value="createdAt">Oldest</SelectItem>
//               <SelectItem value="name">Name A→Z</SelectItem>
//               <SelectItem value="-name">Name Z→A</SelectItem>
//             </SelectContent>
//           </Select>
//         </CardContent>
//       </Card>
//       {/* Classes table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>All Classes</CardTitle>
//           <CardDescription>Manage class structure and sections</CardDescription>
//         </CardHeader>

//         <CardContent>
//           {isLoading ? (
//             <div className="py-6 flex justify-center">
//               <LoadingSpinner />
//             </div>
//           ) : !data?.data?.length ? (
//             <EmptyState
//               title="No classes"
//               description="Add your first class"
//               action={
//                 <Button onClick={() => setIsAddOpen(true)}>Add Class</Button>
//               }
//             />
//           ) : (
//             <>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Academic Year</TableHead>
//                     <TableHead>Sections</TableHead>
//                     <TableHead>Subjects</TableHead>
//                     <TableHead>Capacity</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {data.data.map((cls) => (
//                     <TableRow key={cls._id}>
//                       <TableCell className="font-medium">{cls.name}</TableCell>
//                       <TableCell>{cls.academicYear}</TableCell>
//                       <TableCell>
//                         {(cls.sections || []).length > 0
//                           ? cls.sections.map((s, i) => (
//                               <div key={i} className="text-sm">
//                                 <span className="font-medium">
//                                   Section {s.name}
//                                 </span>
//                                 {s.classTeacher?.name && (
//                                   <span className="text-muted-foreground">
//                                     {" "}
//                                     ({s.classTeacher.name})
//                                   </span>
//                                 )}
//                               </div>
//                             ))
//                           : "-"}
//                       </TableCell>

//                       <TableCell>
//                         {(cls.subjects || []).length > 0
//                           ? cls.subjects.map((s, i) => (
//                               <div key={i} className="text-sm">
//                                 <span className="font-medium">{s.name}</span>
//                                 {s.teacher?.name && (
//                                   <span className="text-muted-foreground">
//                                     {" "}
//                                     ({s.teacher.name})
//                                   </span>
//                                 )}
//                               </div>
//                             ))
//                           : "-"}
//                       </TableCell>

//                       <TableCell>
//                         {(cls.sections || []).reduce(
//                           (acc, s) => acc + (s.capacity || 0),
//                           0
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             variant="ghost"
//                             onClick={() => {
//                               handleEdit(cls);
//                             }}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             onClick={() => handleDelete(cls._id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {/* Pagination */}
//               <div className="flex items-center justify-between mt-4">
//                 <div className="text-sm text-muted-foreground">
//                   Page {data.page || 1} of {data.totalPages || 1} —{" "}
//                   {data.total || 0} classes
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     disabled={(data.page || 1) <= 1}
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   >
//                     Prev
//                   </Button>
//                   <Button
//                     disabled={(data.page || 1) >= (data.totalPages || 1)}
//                     onClick={() => setPage((p) => p + 1)}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//       {/* Attendance pie & teacher report */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Attendance Summary (selected class)</CardTitle>
//             <CardDescription>
//               Select a class to show attendance chart
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="mb-3">
//               <Select onValueChange={(v) => loadAttendanceSummary(v)}>
//                 <SelectTrigger className="w-64">
//                   <SelectValue placeholder="Choose class for attendance" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {data?.data?.map((c) => (
//                     <SelectItem key={c._id} value={c.name}>
//                       {c.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={analytics}>
//                 <XAxis dataKey="_id" />
//                 <Tooltip />
//                 <Bar dataKey="total" />
//                 <Bar dataKey="active" />
//               </BarChart>
//             </ResponsiveContainer>

//             {attendanceSummary?.length ? (
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie
//                     dataKey="value"
//                     data={attendanceSummary}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label
//                   >
//                     {attendanceSummary.map((entry, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="text-sm text-muted-foreground">
//                 No attendance summary loaded
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Teacher Report</CardTitle>
//             <CardDescription>
//               Export teacher workload & subjects
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="mb-3 text-sm text-muted-foreground">
//               Generates a CSV showing each teacher, number of classes/subjects
//               assigned.
//             </p>
//             <div className="flex gap-2">
//               <Button onClick={exportTeacherReport}>
//                 Export Teacher Report (CSV)
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//       <ClassFormDialog
//         open={isAddOpen}
//         onOpenChange={setIsAddOpen}
//         onSubmit={onSubmit}
//         defaultValues={selectedClass}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  TrendingUp,
  School,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  Line,
} from "recharts";
import ClassFormDialog from "./ClassFormDialog";

const fetcher = (url) => fetch(url).then((r) => r.json());
const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export function ClassesContent() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-createdAt");
  const [attendanceClass, setAttendanceClass] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("page", String(page));
    p.set("limit", String(limit));
    p.set("sort", sort);
    return p.toString();
  }, [search, page, limit, sort]);

  // Data Fetching
  const {
    data: classRes,
    isLoading,
    mutate,
  } = useSWR(`/api/academics/classes?${params}`, fetcher);
  const { data: analytics } = useSWR("/api/students/analytics", fetcher);
  const {
    data: apiStats,
    isLoading: statsLoading,
    error,
  } = useSWR("/api/dashboard/stats", fetcher, { refreshInterval: 30000 });
  const statsData = apiStats || undefined;

  const classData =
    statsData?.classWiseStudents?.map((cls) => ({
      name: `Class ${cls._id}`,
      students: cls.count,
    })) ?? [];

  // Attendance Summary Fetching
  const { data: attRes } = useSWR(
    attendanceClass
      ? `/api/attendance/summary?class=${encodeURIComponent(attendanceClass)}`
      : null,
    fetcher
  );

  // Transform raw summary for Recharts
  const pieData = useMemo(() => {
    if (!attRes?.summary?.length) return [];
    // Taking the latest day's summary from the array
    const latest = attRes.summary[attRes.summary.length - 1];
    return [
      { name: "Present", value: latest.totalPresent },
      { name: "Absent", value: latest.totalAbsent },
      { name: "Leave", value: latest.totalLeave },
    ];
  }, [attRes]);

  // Attendance Summary Fetching
  const { data: weeklyAttendance } = useSWR(
    "/api/dashboard/weekly-attendance",
    fetcher
  );

  const weeklyData =
    weeklyAttendance && weeklyAttendance.length
      ? weeklyAttendance
      : [
          { day: "Mon", present: 0, absent: 0 },
          { day: "Tue", present: 0, absent: 0 },
          { day: "Wed", present: 0, absent: 0 },
          { day: "Thu", present: 0, absent: 0 },
          { day: "Fri", present: 0, absent: 0 },
        ];
  const totalPresent = weeklyData.reduce((a, b) => a + b.present, 0);
  const totalAbsent = weeklyData.reduce((a, b) => a + b.absent, 0);
  const attendanceRate = totalPresent
    ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
    : 0;
  const stats = [
    {
      label: "Total Classes",
      value: classRes?.total || 0,
      icon: School,
      color: "text-blue-600",
    },
    {
      label: "Active Students",
      value: analytics?.reduce((acc, curr) => acc + curr.active, 0) || 0,
      icon: Users,
      color: "text-emerald-600",
    },
    {
      label: "Avg Attendance",
      value: "92%",
      icon: TrendingUp,
      color: "text-amber-600",
    },
  ];

  async function onSubmit(form) {
    try {
      const method = selectedClass ? "PUT" : "POST";
      const payload = selectedClass
        ? { ...form, _id: selectedClass._id }
        : form;

      const res = await fetch("/api/academics/classes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save class");
      toast.success(selectedClass ? "Class updated" : "Class added");
      setIsAddOpen(false);
      setSelectedClass(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "Are you sure? This will remove all sections and schedules for this class."
      )
    )
      return;
    try {
      const res = await fetch(`/api/academics/classes?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Class deleted");
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleEdit(cls) {
    setSelectedClass(cls);
    setIsAddOpen(true);
  }

  async function exportCSV() {
    try {
      const res = await fetch(`/api/academics/classes/export/csv`);
      if (!res.ok) throw new Error("Export failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
      saveAs(
        blob,
        `academic_structure_${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Academic Structure"
        description="Configure classes, departments, and class teachers"
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200"
            onClick={exportCSV}
          >
            <FileText className="h-4 w-4 mr-2 text-zinc-500" /> Export CSV
          </Button>
          <Button
            className="rounded-xl bg-primary shadow-lg shadow-primary/20"
            onClick={() => {
              setSelectedClass(null);
              setIsAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Class
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card
            key={i}
            className="border-none shadow-sm bg-white/50 backdrop-blur-sm"
          >
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {s.label}
                </p>
                <p className="text-3xl font-black italic tracking-tighter mt-1">
                  {s.value}
                </p>
              </div>
              <div className={`p-3 rounded-2xl bg-zinc-50 ${s.color}`}>
                <s.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] border-zinc-200/60 shadow-xl shadow-zinc-200/20 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-wrap gap-4 items-center justify-between bg-zinc-50/50">
          <Input
            placeholder="Filter classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl bg-white border-zinc-200 max-w-md"
          />
          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="w-[120px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <LoadingSpinner />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Loading Academic Data...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest pl-8">
                    Class Identity
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Sections & Teachers
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Subjects
                  </TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">
                    Capacity
                  </TableHead>
                  <TableHead className="text-right pr-8 font-black uppercase text-[10px] tracking-widest">
                    Manage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classRes?.data?.map((cls) => (
                  <TableRow
                    key={cls._id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <TableCell className="pl-8">
                      <div className="font-bold text-lg italic tracking-tighter">
                        {cls.name}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        {cls.academicYear}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {cls.sections?.map((s, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="rounded-lg bg-blue-50 text-blue-700 px-3 py-1"
                          >
                            {s.name} •{" "}
                            <span className="text-[9px] opacity-70 ml-1 font-normal">
                              {s.classTeacher?.name || "No Teacher"}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2 overflow-hidden">
                        {cls.subjects?.slice(0, 3).map((sub, i) => (
                          <div
                            key={i}
                            title={sub.name}
                            className="h-8 w-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-black uppercase italic text-zinc-600"
                          >
                            {sub.name.substring(0, 2)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-1 rounded">
                        {cls.sections?.reduce(
                          (acc, s) => acc + (s.capacity || 0),
                          0
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => handleEdit(cls)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => handleDelete(cls._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <Card className="lg:col-span-1 rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic">
              Attendance Distribution
            </CardTitle>
            <Select onValueChange={setAttendanceClass}>
              <SelectTrigger className="mt-4 bg-zinc-800 border-zinc-700 text-white rounded-xl">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classRes?.data?.map((c) => (
                  <SelectItem key={c._id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-8 flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-[10px] font-black uppercase text-zinc-500">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-zinc-400 italic text-xs">
                Select a class with attendance data
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Charts Row */}

        {/* Weekly Attendance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Weekly Attendance</CardTitle>
                <CardDescription>
                  Student attendance trend this week
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-normal">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40 ">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient
                      id="presentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    className="text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value, name) => [
                      value,
                      name === "present" ? "Present" : "Absent",
                    ]}
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    className="text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
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
                  <Bar
                    dataKey="students"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClassFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={onSubmit}
        defaultValues={selectedClass}
        isLoading={isLoading}
      />
    </div>
  );
}
