// "use client";

// import { useState, useEffect } from "react";
// import useSWR, { mutate } from "swr";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Search,
//   Download,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Save,
//   RefreshCw,
// } from "lucide-react";
// import { format } from "date-fns";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// export function TeacherAttendanceContent() {
//   const { toast } = useToast();
//   const [selectedDate, setSelectedDate] = useState(
//     format(new Date(), "yyyy-MM-dd")
//   );
//   const [attendance, setAttendance] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//    const [isDeleting, setIsDeleting] = useState(false);

//   // 1. Fetch Teachers
//   const { data: teachersData, isLoading: teachersLoading } = useSWR(
//     `/api/teachers`,
//     fetcher
//   );
//   const teachers = teachersData?.teachers || [];

//   // 2. Fetch Existing Attendance for Selected Date
//   const { data: existingAttendanceData, isLoading: attendanceLoading } = useSWR(
//     `/api/attendance?date=${selectedDate}&type=Teacher`,
//     fetcher
//   );

//   // 3. Sync local state with Database records
//   useEffect(() => {
//     if (existingAttendanceData?.attendance?.length > 0) {
//       // If records exist in DB, populate the UI
//       const dbRecords = existingAttendanceData.attendance[0].records;
//       const mappedAttendance = {};
//       dbRecords.forEach((rec) => {
//         mappedAttendance[rec.personId] = rec.status.toLowerCase();
//       });
//       setAttendance(mappedAttendance);
//     } else if (teachers.length > 0) {
//       // Default to "present" for new entries
//       const defaultAttendance = {};
//       teachers.forEach((t) => {
//         defaultAttendance[t._id] = "present";
//       });
//       setAttendance(defaultAttendance);
//     }
//   }, [existingAttendanceData, teachers, selectedDate]);

//   const filteredTeachers = teachers.filter((teacher) => {
//     return (
//       teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       teacher.employeeId.includes(searchQuery)
//     );
//   });

//   const handleAttendanceChange = (teacherId, status) => {
//     setAttendance((prev) => ({ ...prev, [teacherId]: status }));
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       // Format records for the Backend Model
//       const records = teachers.map((t) => ({
//         personId: t._id,
//         name: t.name,
//         status: attendance[t._id]
//           ? attendance[t._id].charAt(0).toUpperCase() +
//             attendance[t._id].slice(1)
//           : "Present",
//       }));

//       const payload = {
//         date: selectedDate,
//         type: "Teacher",
//         records,
//         // Since it's Teacher attendance, we pass null/dummy for class/section
//         // as per your route requirements
//         classId: "000000000000000000000000", // Placeholder if model requires ObjectId
//         sectionId: "Staff",
//       };

//       const res = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to save");

//       mutate(`/api/attendance?date=${selectedDate}&type=Teacher`); // Refresh data
//       toast({
//         title: "Success",
//         description: "Teacher attendance saved to database.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to save to database.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//    const handleDeleteTeacherAttendance = async () => {
//      if (!confirm("Clear all teacher attendance for this date?")) return;

//      setIsDeleting(true);
//      try {
//        // We only need date and type for teachers
//        const res = await fetch(`/api/attendance?date=${date}&type=Teacher`, {
//          method: "DELETE",
//        });

//        if (res.ok) {
//          toast({
//            title: "Success",
//            description: "Teacher attendance cleared for this day.",
//          });
//          mutate(); // Refresh SWR data
//        } else {
//          throw new Error();
//        }
//      } catch (error) {
//        toast({
//          title: "Error",
//          description: "Could not clear records.",
//          variant: "destructive",
//        });
//      } finally {
//        setIsDeleting(false);
//      }
//    };


//   const counts = {
//     present: Object.values(attendance).filter((s) => s === "present").length,
//     absent: Object.values(attendance).filter((s) => s === "absent").length,
//     late: Object.values(attendance).filter((s) => s === "late").length,
//     leave: Object.values(attendance).filter((s) => s === "leave").length,
//   };

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Staff Attendance"
//         description="Real-time database sync for staff records"
//       >
//         <Button variant="outline" size="sm">
//           <Download className="h-4 w-4 mr-2" /> Export
//         </Button>
//       </PageHeader>

//       <Card>
//         <CardContent className="p-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//             <div className="space-y-1.5">
//               <Label>Select Date</Label>
//               <Input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label>Search Staff</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Name or ID..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9"
//                 />
//               </div>
//             </div>
//             <Button
//               onClick={handleSave}
//               disabled={isSaving || attendanceLoading}
//               className="w-full bg-indigo-600 hover:bg-indigo-700"
//             >
//               {isSaving ? (
//                 <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//               ) : (
//                 <Save className="h-4 w-4 mr-2" />
//               )}
//               Save to Database
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats Section */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <StatCard
//           icon={<CheckCircle2 className="text-green-600" />}
//           count={counts.present}
//           label="Present"
//           bgColor="bg-green-50"
//         />
//         <StatCard
//           icon={<XCircle className="text-red-600" />}
//           count={counts.absent}
//           label="Absent"
//           bgColor="bg-red-50"
//         />
//         <StatCard
//           icon={<Clock className="text-amber-600" />}
//           count={counts.late}
//           label="Late"
//           bgColor="bg-amber-50"
//         />
//         <StatCard
//           icon={<AlertCircle className="text-blue-600" />}
//           count={counts.leave}
//           label="Leave"
//           bgColor="bg-blue-50"
//         />
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">
//             Staff List - {format(new Date(selectedDate), "PPP")}
//           </CardTitle>
//           <CardDescription>
//             Click status to mark. Changes must be saved.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {teachersLoading || attendanceLoading ? (
//             <div className="py-10">
//               <LoadingSpinner size="lg" className="mx-auto" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {filteredTeachers.map((teacher) => (
//                 <Card
//                   key={teacher._id}
//                   className="shadow-none border-slate-200"
//                 >
//                   <CardContent className="p-3">
//                     <div className="flex items-center gap-3 mb-3">
//                       <Avatar className="h-8 w-8">
//                         <AvatarFallback className="text-[10px]">
//                           {teacher.name.charAt(0)}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1 overflow-hidden">
//                         <p className="font-bold text-xs truncate uppercase">
//                           {teacher.name}
//                         </p>
//                         <p className="text-[10px] text-slate-500">
//                           {teacher.employeeId}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-4 gap-1">
//                       {["present", "absent", "late", "leave"].map((status) => (
//                         <Button
//                           key={status}
//                           size="sm"
//                           variant={
//                             attendance[teacher._id] === status
//                               ? "default"
//                               : "outline"
//                           }
//                           className={`h-7 text-[10px] uppercase font-bold ${
//                             attendance[teacher._id] === status
//                               ? getStatusColor(status)
//                               : "text-slate-400"
//                           }`}
//                           onClick={() =>
//                             handleAttendanceChange(teacher._id, status)
//                           }
//                         >
//                           {status.charAt(0)}
//                         </Button>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function StatCard({ icon, count, label, bgColor }) {
//   return (
//     <Card className={`${bgColor} border-none`}>
//       <CardContent className="p-4 flex items-center gap-3">
//         {icon}
//         <div>
//           <p className="text-xl font-black">{count}</p>
//           <p className="text-[10px] uppercase font-bold opacity-70">{label}</p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// const getStatusColor = (status) => {
//   switch (status) {
//     case "present":
//       return "bg-green-600 hover:bg-green-700";
//     case "absent":
//       return "bg-red-600 hover:bg-red-700";
//     case "late":
//       return "bg-amber-500 hover:bg-amber-600";
//     case "leave":
//       return "bg-blue-600 hover:bg-blue-700";
//     default:
//       return "";
//   }
// };

"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  RefreshCw,
  Trash2,
  Database,
} from "lucide-react";
import { format } from "date-fns";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function TeacherAttendanceContent() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Teachers List
  const { data: teachersData, isLoading: teachersLoading } = useSWR(
    `/api/teachers`,
    fetcher
  );
  const teachers = teachersData?.teachers || [];

  // 2. Fetch Existing Attendance from DB
  const {
    data: dbResponse,
    isLoading: attendanceLoading,
    mutate: mutateTeacherAttendance,
  } = useSWR(
    `/api/attendance?date=${selectedDate}&type=Teacher&sectionId=Staff`,
    fetcher
  );

  const existingData = dbResponse?.attendance?.[0];
  const isExistingRecord = !!existingData;

  // 3. Sync Logic: Ensures state matches DB (Capitalized statuses)
  useEffect(() => {
    if (!teachers.length) return;

    if (existingData?.records) {
      // Map existing DB records to local state
      const mapped = {};
      existingData.records.forEach((rec) => {
        mapped[rec.personId] = rec.status; // e.g., "Present", "Absent"
      });
      setAttendance(mapped);
    } else {
      // Default for new entry
      const defaults = {};
      teachers.forEach((t) => {
        defaults[t._id] = "Present";
      });
      setAttendance(defaults);
    }
  }, [existingData, teachers, selectedDate]);

  const handleAttendanceChange = (teacherId, status) => {
    setAttendance((prev) => ({ ...prev, [teacherId]: status }));
  };

  // 4. Save/Update Logic
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const records = teachers.map((t) => ({
        personId: t._id,
        name: t.name,
        status: attendance[t._id] || "Present",
      }));

      const payload = {
        date: selectedDate,
        type: "Teacher",
        records,
        sectionId: "Staff", // Used for grouping teachers
        classId: null, // Schema allows null for Teachers
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      mutate(); // Refresh SWR
      toast({ title: "Success", description: "Attendance saved to database." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Save failed",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Delete Logic
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure? This will permanently delete records for this date."
      )
    )
      return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/attendance?date=${selectedDate}&type=Teacher&sectionId=Staff`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      mutate(); // Clear view
      toast({ title: "Deleted", description: "Attendance records cleared." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId?.includes(searchQuery)
  );

  const counts = {
    present: Object.values(attendance).filter((s) => s === "Present").length,
    absent: Object.values(attendance).filter((s) => s === "Absent").length,
    late: Object.values(attendance).filter((s) => s === "Late").length,
    leave: Object.values(attendance).filter((s) => s === "Leave").length,
  };

  const handleIndividualTeacherUpdate = async (teacherId, newStatus) => {
    // 1. Instant UI update
    setAttendance((prev) => ({ ...prev, [teacherId]: newStatus }));

    // 2. Sync to DB if a record for today already exists
    if (dbResponse?.attendance?.length > 0) {
      const attendanceId = dbResponse.attendance[0]._id;

      try {
        const res = await fetch("/api/attendance/record", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendanceId,
            personId: teacherId,
            status: newStatus, // e.g., "Present", "Absent"
          }),
        });

        if (res.ok) {
          toast({ title: "Updated", description: "Staff status synced." });
          mutateTeacherAttendance();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Sync failed",
          variant: "destructive",
        });
      }
    }
  };

  const handleIndividualTeacherDelete = async (teacherId) => {
    if (!confirm("Remove this teacher's record for today?")) return;
    if (!dbResponse?.attendance?.[0]) return;

    const attendanceId = dbResponse.attendance[0]._id;

    try {
      const res = await fetch(
        `/api/attendance/record?attendanceId=${attendanceId}&personId=${teacherId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        toast({ title: "Removed", description: "Record deleted." });
        mutateTeacherAttendance();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Attendance"
        description="Daily faculty management"
      >
        <div className="flex gap-2">
          {isExistingRecord && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <RefreshCw className="animate-spin h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Day
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </PageHeader>

      <Card className="border-indigo-100 bg-slate-50/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Search Staff</Label>
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
            <Button
              onClick={handleSave}
              disabled={isSaving || attendanceLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isExistingRecord ? "Update Records" : "Save Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Status Info */}
      {isExistingRecord && (
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 p-2 rounded-md border border-indigo-100">
          <Database className="h-3.5 w-3.5" />
          Historical records loaded for this date. Changes will overwrite
          existing data.
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="text-emerald-600" />}
          count={counts.present}
          label="Present"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<XCircle className="text-rose-600" />}
          count={counts.absent}
          label="Absent"
          bgColor="bg-rose-50"
        />
        <StatCard
          icon={<Clock className="text-amber-600" />}
          count={counts.late}
          label="Late"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<AlertCircle className="text-sky-600" />}
          count={counts.leave}
          label="Leave"
          bgColor="bg-sky-50"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Staff List — {format(new Date(selectedDate), "PPP")}
          </CardTitle>
          <CardDescription>
            Records are automatically loaded from history if available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teachersLoading || attendanceLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((teacher) => (
                <Card
                  key={teacher._id}
                  className="relative shadow-none border-slate-200"
                >
                  {/* Individual Delete Button (Top Right) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 text-slate-300 hover:text-red-500"
                    onClick={() => handleIndividualTeacherDelete(teacher._id)}
                    disabled={!dbResponse?.attendance?.length}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px]">
                          {teacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-xs truncate uppercase">
                          {teacher.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {teacher.employeeId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {["Present", "Absent", "Late", "Leave"].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            attendance[teacher._id] === status
                              ? "default"
                              : "outline"
                          }
                          className={`h-7 text-[10px] uppercase font-bold ${
                            attendance[teacher._id] === status
                              ? getStatusColor(status)
                              : "text-slate-400"
                          }`}
                          onClick={() =>
                            handleIndividualTeacherUpdate(teacher._id, status)
                          }
                        >
                          {status.charAt(0)}
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
  );
}

function StatCard({ icon, count, label, bgColor }) {
  return (
    <Card className={`${bgColor} border-none shadow-sm`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl font-black text-slate-800 leading-none">
            {count}
          </p>
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "Present":
      return "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100";
    case "Absent":
      return "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100";
    case "Late":
      return "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100";
    case "Leave":
      return "bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-100";
    default:
      return "";
  }
};