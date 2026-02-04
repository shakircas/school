// "use client";

// import { useState, useEffect, useMemo } from "react";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { useToast } from "@/hooks/use-toast";
// import { useOnlineStatus } from "@/hooks/use-online-status";
// import {
//   Calendar,
//   Save,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserCheck,
//   Trash2,
//   RotateCcw,
// } from "lucide-react";
// import { useClasses } from "../hooks/useClasses";

// const fetcher = (url) => fetch(url).then((res) => res.json());
// const attendanceStatuses = ["Present", "Absent", "Late", "Leave", "Half Day"];

// export default function StudentAttendanceContent() {
//   const { toast } = useToast();
//   const isOnline = useOnlineStatus();
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
//   const [attendance, setAttendance] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   // ... existing states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [classId, setClassId] = useState("");
//   const [sectionId, setSectionId] = useState("");
//   const { classes } = useClasses();

//   const selectedClass = useMemo(
//     () => classes.find((c) => c._id === classId),
//     [classes, classId],
//   );

//   // Fetch Students
//   const { data: studentsData, isLoading: loadingStudents } = useSWR(
//     classId && sectionId
//       ? `/api/students?classId=${classId}&sectionId=${sectionId}&status=Active`
//       : null,
//     fetcher,
//   );

//   // Fetch Existing Attendance (Actual back data)
//   const {
//     data: dbResponse,
//     mutate: mutateAttendance,
//     isLoading: loadingAttendance,
//   } = useSWR(
//     classId && sectionId && date
//       ? `/api/attendance?date=${date}&type=Student&classId=${classId}&sectionId=${sectionId}`
//       : null,
//     fetcher,
//   );

//   const students =
//     studentsData?.students.sort((a, b) => a.rollNumber - b.rollNumber) || [];

//   const hasExistingData = !!dbResponse?.attendance?.length;

//   // Sync Logic
//   // 2. Sync Logic - This updates the 'attendance' state whenever DB data or Student list changes
//   useEffect(() => {
//     if (!students.length) return;

//     // Check if we have records for this specific day in the database
//     const existingDoc = dbResponse?.attendance?.[0];

//     if (existingDoc && existingDoc.records) {
//       const attendanceMap = {};
//       existingDoc.records.forEach((record) => {
//         attendanceMap[record.personId] = record.status; // Pulls 'Absent', 'Late', etc.
//       });
//       setAttendance(attendanceMap);
//     } else {
//       // If NO data exists in DB for this date, default to 'Present'
//       const defaultAttendance = {};
//       students.forEach((student) => {
//         defaultAttendance[student._id] = "Present";
//       });
//       setAttendance(defaultAttendance);
//     }
//   }, [dbResponse, students]);
//   const handleStatusChange = (id, status) =>
//     setAttendance((prev) => ({ ...prev, [id]: status }));

//   const handleMarkAll = (status) => {
//     const updated = {};
//     students.forEach((s) => (updated[s._id] = status));
//     setAttendance(updated);
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       const payload = {
//         date,
//         type: "Student",
//         classId,
//         sectionId,
//         records: students.map((s) => ({
//           personId: s._id,
//           name: s.name,
//           rollNumber: s.rollNumber,
//           status: attendance[s._id] || "Present",
//         })),
//       };

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       // 1️⃣ Parse the response body to get the error message
//       const result = await res.json();

//       if (!res.ok) {
//         // 2️⃣ Throw the specific error message from the backend
//         throw new Error(
//           result.error || result.message || "Failed to sync attendance",
//         );
//       }

//       toast({
//         title: "Success",
//         description: "Attendance synced with database.",
//         className: "bg-emerald-500 text-white", // Optional: style your success toast
//       });

//       mutateAttendance();
//     } catch (error) {
//       // 3️⃣ Display the actual error message in the toast
//       toast({
//         title: "Action Denied",
//         description: error.message, // This will now say "Cannot mark attendance on Sundays", etc.
//         variant: "destructive",
//       });
//       console.error("Sync Error:", error.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm("Delete all attendance records for this class on this date?"))
//       return;
//     setIsDeleting(true);
//     try {
//       const res = await fetch(
//         `/api/attendance?date=${date}&type=Student&classId=${classId}&sectionId=${sectionId}`,
//         {
//           method: "DELETE",
//         },
//       );
//       if (!res.ok) throw new Error();
//       toast({
//         title: "Deleted",
//         description: "Records removed from database.",
//       });
//       mutateAttendance();
//     } catch (err) {
//       toast({ title: "Delete Failed", variant: "destructive" });
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const stats = useMemo(
//     () => ({
//       present: Object.values(attendance).filter((v) => v === "Present").length,
//       absent: Object.values(attendance).filter((v) => v === "Absent").length,
//       late: Object.values(attendance).filter((v) => v === "Late").length,
//     }),
//     [attendance],
//   );

//   // Inside your Student Attendance Component

//   const handleIndividualUpdate = async (studentId, newStatus) => {
//     // 1. Update UI immediately for responsiveness
//     setAttendance((prev) => ({ ...prev, [studentId]: newStatus }));

//     // 2. Use dbResponse (the variable you actually defined)
//     if (dbResponse?.attendance?.length > 0) {
//       const attendanceId = dbResponse.attendance[0]._id;

//       try {
//         const res = await fetch("/api/attendance/record", {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             attendanceId,
//             personId: studentId,
//             status: newStatus,
//           }),
//         });

//         if (res.ok) {
//           toast({ title: "Updated", description: "Status synced." });
//           mutateAttendance(); // Use the correct mutate function name
//         }
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: "Sync failed",
//           variant: "destructive",
//         });
//       }
//     }
//   };

//   const handleIndividualDelete = async (studentId) => {
//     if (!confirm("Remove this student's record for today?")) return;
//     // Use dbResponse here too
//     if (!dbResponse?.attendance?.[0]) return;

//     const attendanceId = dbResponse.attendance[0]._id;

//     try {
//       const res = await fetch(
//         `/api/attendance/record?attendanceId=${attendanceId}&personId=${studentId}`,
//         { method: "DELETE" },
//       );

//       if (res.ok) {
//         toast({ title: "Removed", description: "Record deleted." });
//         mutateAttendance(); // Use the correct mutate function name
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Delete failed",
//         variant: "destructive",
//       });
//     }
//   };

//   // Filter students based on name or roll number
//   const filteredStudents = useMemo(() => {
//     if (!searchTerm) return students;
//     return students.filter(
//       (s) =>
//         s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         s.rollNumber.toString().includes(searchTerm),
//     );
//   }, [students, searchTerm]);

//   return (
//     <div className="space-y-6 pb-12">
//       <PageHeader
//         title="Student Attendance"
//         description="Sync daily records with database"
//       >
//         {!isOnline && <Badge variant="destructive">Offline Mode</Badge>}
//         {hasExistingData && (
//           <Badge
//             variant="outline"
//             className="text-emerald-600 border-emerald-200 bg-emerald-50"
//           >
//             Saved in DB
//           </Badge>
//         )}
//       </PageHeader>

//       <Card className="border-none shadow-sm bg-slate-50/50">
//         <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase">
//               Date
//             </label>
//             <Input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="bg-white"
//             />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase">
//               Class
//             </label>
//             <Select value={classId} onValueChange={setClassId}>
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="Select Class" />
//               </SelectTrigger>
//               <SelectContent>
//                 {classes.map((c) => (
//                   <SelectItem key={c._id} value={c._id}>
//                     {c.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-500 uppercase">
//               Section
//             </label>
//             <Select
//               value={sectionId}
//               onValueChange={setSectionId}
//               disabled={!classId}
//             >
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="Section" />
//               </SelectTrigger>
//               <SelectContent>
//                 {selectedClass?.sections.map((s) => (
//                   <SelectItem key={s.name} value={s.name}>
//                     {s.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex items-end gap-2 sm:col-span-2">
//             <Button
//               onClick={handleSave}
//               disabled={isSaving || !students.length}
//               className="flex-1 bg-indigo-600 hover:bg-indigo-700"
//             >
//               {isSaving ? (
//                 <LoadingSpinner size="sm" className="mr-2" />
//               ) : (
//                 <Save className="h-4 w-4 mr-2" />
//               )}
//               {hasExistingData ? "Update Records" : "Save Attendance"}
//             </Button>
//             {hasExistingData && (
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={handleDelete}
//                 disabled={isDeleting}
//                 className="text-rose-500 hover:bg-rose-50 border-rose-100"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {students.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard
//             label="Total Students"
//             value={students.length}
//             icon={<UserCheck />}
//             color="text-slate-600"
//           />
//           <StatCard
//             label="Present"
//             value={stats.present}
//             icon={<CheckCircle />}
//             color="text-emerald-600"
//           />
//           <StatCard
//             label="Absent"
//             value={stats.absent}
//             icon={<XCircle />}
//             color="text-rose-600"
//           />
//           <StatCard
//             label="Late"
//             value={stats.late}
//             icon={<Clock />}
//             color="text-amber-600"
//           />
//         </div>
//       )}

//       {students.length > 0 && (
//         <Card className="overflow-hidden border-none shadow-sm">
//           <div className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-4 w-full md:w-auto">
//               <h3 className="font-bold text-slate-700 whitespace-nowrap">
//                 Attendance List
//               </h3>
//               <div className="relative w-full md:w-64">
//                 <Input
//                   placeholder="Search name or roll no..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="h-9 pl-9 text-sm focus-visible:ring-indigo-500"
//                 />
//                 <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
//               </div>
//             </div>

//             <div className="flex gap-2 w-full md:w-auto justify-end">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-emerald-600 text-xs font-bold hover:bg-emerald-50"
//                 onClick={() => handleMarkAll("Present")}
//               >
//                 MARK ALL P
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-rose-600 text-xs font-bold hover:bg-rose-50"
//                 onClick={() => handleMarkAll("Absent")}
//               >
//                 MARK ALL A
//               </Button>
//             </div>
//           </div>

//           {/* Metadata bar */}
//           {hasExistingData && dbResponse.attendance[0].markedBy && (
//             <div className="flex items-center gap-2 m-4 mt-0 text-[11px] text-muted-foreground bg-slate-50 p-2 rounded border border-slate-100">
//               <Clock className="h-3.5 w-3.5 text-indigo-500" />
//               <span>
//                 Records managed by{" "}
//                 <b className="text-slate-700">
//                   {dbResponse.attendance[0].markedBy.name}
//                 </b>{" "}
//                 • Last Update:{" "}
//                 {new Date(
//                   dbResponse.attendance[0].updatedAt,
//                 ).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </span>
//             </div>
//           )}

//           {/* Table Area */}
//           <div className="p-0">
//             {loadingStudents ? (
//               <div className="py-20 text-center">
//                 <LoadingSpinner size="lg" />
//               </div>
//             ) : filteredStudents.length === 0 ? (
//               <div className="py-20 text-center bg-white border-t">
//                 <RotateCcw className="h-8 w-8 text-slate-300 mx-auto mb-2" />
//                 <p className="text-sm text-slate-500">
//                   No students match your search "{searchTerm}"
//                 </p>
//                 <Button
//                   variant="link"
//                   className="text-indigo-600 text-xs"
//                   onClick={() => setSearchTerm("")}
//                 >
//                   Clear search
//                 </Button>
//               </div>
//             ) : (
//               <div className="rounded-b-lg overflow-hidden border-t">
//                 <Table>
//                   <TableHeader className="bg-slate-50/80">
//                     <TableRow>
//                       <TableHead className="w-16 text-center">#</TableHead>
//                       <TableHead>Student Details</TableHead>
//                       <TableHead>Roll No.</TableHead>
//                       <TableHead>Status Selection</TableHead>
//                       <TableHead className="text-right pr-6">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody className="bg-white">
//                     {filteredStudents.map((student, index) => (
//                       <TableRow
//                         key={student._id}
//                         className="hover:bg-slate-50/50 transition-colors"
//                       >
//                         <TableCell className="text-center text-slate-400 font-mono text-xs">
//                           {index + 1}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
//                               <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold">
//                                 {student.name?.charAt(0)}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div className="flex flex-col">
//                               <span className="font-bold text-slate-700 text-sm leading-none mb-1">
//                                 {student.name}
//                               </span>
//                               <span className="text-[10px] text-slate-500 uppercase tracking-tight">
//                                 {student.classId.name} • {student.sectionId}
//                               </span>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="font-mono text-xs text-slate-600 font-semibold">
//                           {student.rollNumber}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Select
//                               value={attendance[student._id] || "Present"}
//                               onValueChange={(v) =>
//                                 handleIndividualUpdate(student._id, v)
//                               }
//                             >
//                               <SelectTrigger className="w-28 h-8 text-[11px] font-bold">
//                                 <SelectValue />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {attendanceStatuses.map((s) => (
//                                   <SelectItem
//                                     key={s}
//                                     value={s}
//                                     className="text-xs"
//                                   >
//                                     {s}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>

//                             <div className="flex gap-1 border-l pl-2">
//                               <QuickActionBtn
//                                 active={attendance[student._id] === "Present"}
//                                 color="bg-emerald-500"
//                                 icon={<CheckCircle />}
//                                 onClick={() =>
//                                   handleIndividualUpdate(student._id, "Present")
//                                 }
//                               />
//                               <QuickActionBtn
//                                 active={attendance[student._id] === "Absent"}
//                                 color="bg-rose-500"
//                                 icon={<XCircle />}
//                                 onClick={() =>
//                                   handleIndividualUpdate(student._id, "Absent")
//                                 }
//                               />
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right pr-6">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
//                             onClick={() => handleIndividualDelete(student._id)}
//                             disabled={!hasExistingData}
//                           >
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }

// // Sub-components for cleaner code
// function StatCard({ label, value, icon, color }) {
//   return (
//     <Card className="border-none shadow-sm">
//       <CardContent className="pt-4 flex items-center justify-between">
//         <div>
//           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
//             {label}
//           </p>
//           <p className={`text-2xl font-black ${color}`}>{value}</p>
//         </div>
//         <div className={`${color} opacity-20`}>{icon}</div>
//       </CardContent>
//     </Card>
//   );
// }

// function QuickActionBtn({ active, color, icon, onClick }) {
//   return (
//     <Button
//       variant={active ? "default" : "outline"}
//       size="icon"
//       className={`h-7 w-7 transition-all ${
//         active ? color : "text-slate-300 border-slate-100"
//       }`}
//       onClick={onClick}
//     >
//       {cloneElement(icon, { className: "h-3.5 w-3.5" })}
//     </Button>
//   );
// }

// import { cloneElement } from "react";

"use client";

import { useState, useEffect, useMemo, cloneElement } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  Calendar,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  CalendarOff,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";

const fetcher = (url) => fetch(url).then((res) => res.json());
const attendanceStatuses = ["Present", "Absent", "Late", "Leave", "Half Day"];

export default function StudentAttendanceContent() {
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A");
  const { classes } = useClasses();

  const selectedClass = useMemo(
    () => classes.find((c) => c._id === classId),
    [classes, classId],
  );

  // 🚩 Holiday Check (Hardcoded for now, but ready for DB integration)
  const isSunday = new Date(date).getDay() === 0;
  const HOLIDAYS = ["2026-01-26", "2026-03-23"];
  const isHoliday = HOLIDAYS.includes(date);
  const isNonWorkingDay = isSunday || isHoliday;

  // Fetch Students (Filters by admission date via API)
  const { data: studentsData, isLoading: loadingStudents } = useSWR(
    classId && date
      ? `/api/students?classId=${classId}&sectionId=A&status=Active&date=${date}`
      : null,
    fetcher,
  );

  // Fetch Existing Attendance
  const {
    data: dbResponse,
    mutate: mutateAttendance,
    isLoading: loadingAttendance,
  } = useSWR(
    classId  && date
      ? `/api/attendance?date=${date}&type=Student&classId=${classId}&sectionId=A`
      : null,
    fetcher,
  );

  const students = useMemo(
    () =>
      studentsData?.students?.sort((a, b) => a.rollNumber - b.rollNumber) || [],
    [studentsData],
  );

  const hasExistingData = !!dbResponse?.attendance?.length;

  // Sync DB records to Local State
  useEffect(() => {
    if (!students.length) return;
    const existingDoc = dbResponse?.attendance?.[0];

    if (existingDoc?.records) {
      const attendanceMap = {};
      existingDoc.records.forEach(
        (r) => (attendanceMap[r.personId] = r.status),
      );
      setAttendance(attendanceMap);
    } else {
      const defaultAttendance = {};
      students.forEach((s) => (defaultAttendance[s._id] = "Present"));
      setAttendance(defaultAttendance);
    }
  }, [dbResponse, students]);

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => (updated[s._id] = status));
    setAttendance(updated);
  };

  const handleSave = async () => {
    if (isNonWorkingDay) return;
    setIsSaving(true);
    try {
      const payload = {
        date,
        type: "Student",
        classId,
        sectionId,
        records: students.map((s) => ({
          personId: s._id,
          name: s.name,
          rollNumber: s.rollNumber,
          status: attendance[s._id] || "Present",
        })),
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Sync Failed");

      toast({
        title: "Success",
        description: "Attendance synced.",
        className: "bg-emerald-600 text-white",
      });
      mutateAttendance();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete all records for this date?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/attendance?date=${date}&type=Student&classId=${classId}&sectionId=${sectionId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error();
      toast({ title: "Deleted", description: "Records removed." });
      mutateAttendance();
    } catch (err) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleIndividualUpdate = async (studentId, newStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: newStatus }));
    if (dbResponse?.attendance?.[0]) {
      try {
        await fetch("/api/attendance/record", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendanceId: dbResponse.attendance[0]._id,
            personId: studentId,
            status: newStatus,
          }),
        });
      } catch (e) {
        toast({ title: "Sync Error", variant: "destructive" });
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toString().includes(searchTerm),
    );
  }, [students, searchTerm]);

  const stats = useMemo(
    () => ({
      present: Object.values(attendance).filter((v) => v === "Present").length,
      absent: Object.values(attendance).filter((v) => v === "Absent").length,
      late: Object.values(attendance).filter((v) => v === "Late").length,
    }),
    [attendance],
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <PageHeader
        title="Student Attendance"
        description="Sync daily records with database"
      >
        {!isOnline && (
          <Badge variant="destructive" className="animate-pulse">
            Offline
          </Badge>
        )}
        {hasExistingData && (
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-200 bg-emerald-50"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Database Synced
          </Badge>
        )}
      </PageHeader>

      {/* Filters Section */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 font-medium"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Class
            </label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Section
            </label>
            <Select
              value={sectionId}
              onValueChange={setSectionId}
              // disabled={!classId}
              defaultValue="A"
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {selectedClass?.sections.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4 flex items-end gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !students.length || isNonWorkingDay}
              className={`flex-1 h-10 font-bold tracking-tight shadow-lg shadow-indigo-100 ${isNonWorkingDay ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isNonWorkingDay
                ? "School Closed"
                : hasExistingData
                  ? "Update Data"
                  : "Save Attendance"}
            </Button>
            {hasExistingData && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                className="h-10 w-10 text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {!classId || !sectionId ? (
        <EmptyState
          icon={<Filter className="h-12 w-12 text-slate-200" />}
          title="Setup Filters"
          desc="Please select a class and section to begin marking attendance."
        />
      ) : isNonWorkingDay ? (
        <EmptyState
          icon={<CalendarOff className="h-12 w-12 text-rose-200" />}
          title={isSunday ? "It's a Sunday" : "Public Holiday"}
          desc="Attendance cannot be recorded on non-working days."
        />
      ) : loadingStudents || loadingAttendance ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="h-12 w-12 text-slate-200" />}
          title="No Students Found"
          desc="Either no students are active in this section or none were admitted before this date."
        />
      ) : (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 duration-500">
            <StatCard
              label="Total"
              value={students.length}
              icon={<UserCheck />}
              color="text-slate-600"
            />
            <StatCard
              label="Present"
              value={stats.present}
              icon={<CheckCircle />}
              color="text-emerald-600"
            />
            <StatCard
              label="Absent"
              value={stats.absent}
              icon={<XCircle />}
              color="text-rose-600"
            />
            <StatCard
              label="Late"
              value={stats.late}
              icon={<Clock />}
              color="text-amber-600"
            />
          </div>

          <Card className="border-none shadow-md overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-slate-50 border-none"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 md:flex-none text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleMarkAll("Present")}
                >
                  All Present
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 md:flex-none text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50"
                  onClick={() => handleMarkAll("Absent")}
                >
                  All Absent
                </Button>
              </div>
            </div>

            {/* Table */}
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-12 text-center text-[10px] font-black uppercase">
                    #
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Student
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Roll
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredStudents.map((student, index) => {
                  const isNew =
                    new Date(student.createdAt).toDateString() ===
                    new Date(date).toDateString();
                  return (
                    <TableRow
                      key={student._id}
                      className="group hover:bg-slate-50/80 transition-all border-slate-100"
                    >
                      <TableCell className="text-center font-mono text-xs text-slate-300">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold uppercase">
                              {student.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                              {student.name}
                              {isNew && (
                                <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] h-4 py-0 font-black animate-pulse">
                                  NEW
                                </Badge>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Admission:{" "}
                              {new Date(student.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-slate-600 text-xs">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={attendance[student._id] || "Present"}
                            onValueChange={(v) =>
                              handleIndividualUpdate(student._id, v)
                            }
                          >
                            <SelectTrigger className="w-28 h-8 text-[11px] font-bold rounded-lg border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {attendanceStatuses.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="hidden sm:flex gap-1">
                            <QuickActionBtn
                              active={attendance[student._id] === "Present"}
                              color="bg-emerald-500"
                              icon={<CheckCircle />}
                              onClick={() =>
                                handleIndividualUpdate(student._id, "Present")
                              }
                            />
                            <QuickActionBtn
                              active={attendance[student._id] === "Absent"}
                              color="bg-rose-500"
                              icon={<XCircle />}
                              onClick={() =>
                                handleIndividualUpdate(student._id, "Absent")
                              }
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-200 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleIndividualDelete(student._id)}
                          disabled={!hasExistingData}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── UI HELPERS ─────────────────────────────────────────────────────────────

function EmptyState({ icon, title, desc }) {
  return (
    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 animate-in zoom-in-95 duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
            {label}
          </p>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
        <div className={`${color} bg-slate-50 p-2 rounded-xl`}>
          {cloneElement(icon, { size: 20 })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionBtn({ active, color, icon, onClick }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="icon"
      className={`h-8 w-8 rounded-lg transition-all transform active:scale-90 ${active ? color + " shadow-md" : "text-slate-300 border-slate-100 hover:border-slate-300"}`}
      onClick={onClick}
    >
      {cloneElement(icon, { className: "h-4 w-4" })}
    </Button>
  );
}