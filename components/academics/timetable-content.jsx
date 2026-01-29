// "use client";

// import { useState, useMemo } from "react";
// import useSWR from "swr";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   Clock,
//   User,
//   Trash2,
//   Edit3,
//   AlertTriangle,
//   LayoutGrid,
//   Calendar,
//   Users,
//   BarChart3,
//   ShieldAlert,
//   Search,
//   CheckCircle2,
//   Info,
//   Printer,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// const WEEKDAYS = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];
// const TIME_SLOTS = [
//   "08:00 - 08:40",
//   "08:40 - 09:20",
//   "09:20 - 10:00",
//   "10:00 - 10:40",
//   "11:00 - 11:40",
//   "11:40 - 12:20",
//   "12:20 - 01:00",
// ];

// export function TimetableContent() {
//   const { data, mutate } = useSWR("/api/academics/timetable", fetcher);
//   const { data: teachersRes } = useSWR("/api/teachers", fetcher);
//   const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [formData, setFormData] = useState({
//     day: "",
//     time: "",
//     subjectId: "",
//     teacherId: "",
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [editMeta, setEditMeta] = useState({ index: null, day: "" });

//   const teachers = teachersRes?.teachers || [];
//   const subjects = subjectsRes?.data || [];
//   const classes = data?.data || [];

//   /* --- PRINT HANDLER --- */
//   const handlePrint = () => {
//     window.print();
//   };

//   /* --- DELETE LOGIC --- */
//   const deletePeriod = async (cls, day, index) => {
//     if (!confirm("Are you sure you want to delete this period?")) return;
//     try {
//       const sch = structuredClone(cls.schedule || []);
//       const dayData = sch.find((x) => x.day === day);
//       if (dayData) {
//         dayData.periods.splice(index, 1);
//         const res = await fetch(`/api/academics/timetable/${cls._id}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ schedule: sch }),
//         });
//         if (res.ok) {
//           toast.success("Period removed");
//           mutate();
//         }
//       }
//     } catch (e) {
//       toast.error("Delete failed");
//     }
//   };

//   /* --- WORKLOAD LOGIC --- */
//   const teacherWorkload = useMemo(() => {
//     const stats = {};
//     classes.forEach((cls) => {
//       cls.schedule?.forEach((day) => {
//         day.periods.forEach((p) => {
//           const tId = p.teacher?._id || p.teacher;
//           if (tId) stats[tId] = (stats[tId] || 0) + 1;
//         });
//       });
//     });
//     return stats;
//   }, [classes]);

//   /* --- GLOBAL CONFLICT SCANNER --- */
//   const globalConflicts = useMemo(() => {
//     const conflicts = [];
//     const scheduleMap = {};
//     classes.forEach((cls) => {
//       cls.schedule?.forEach((day) => {
//         day.periods.forEach((p) => {
//           const tId = p.teacher?._id || p.teacher;
//           if (!tId) return;
//           const key = `${day.day}-${p.time}-${tId}`;
//           if (scheduleMap[key]) {
//             conflicts.push({
//               teacher: teachers.find((t) => t._id === tId)?.name || "Unknown",
//               day: day.day,
//               time: p.time,
//               classA: scheduleMap[key].className,
//               classB: cls.name,
//             });
//           } else {
//             scheduleMap[key] = { className: cls.name };
//           }
//         });
//       });
//     });
//     return conflicts;
//   }, [classes, teachers]);

//   /* --- IN-EDITOR CONFLICT CHECK --- */
//   const currentConflict = useMemo(() => {
//     if (
//       !formData.day ||
//       !formData.time ||
//       !formData.teacherId ||
//       !classes.length
//     )
//       return null;
//     for (const cls of classes) {
//       const daySchedule = cls.schedule?.find((s) => s.day === formData.day);
//       if (daySchedule) {
//         const periodIdx = daySchedule.periods.findIndex(
//           (p) =>
//             p.time === formData.time &&
//             (p.teacher?._id === formData.teacherId ||
//               p.teacher === formData.teacherId)
//         );
//         if (periodIdx !== -1) {
//           const isSelf =
//             editMode &&
//             cls._id === selectedClass?._id &&
//             formData.day === editMeta.day &&
//             periodIdx === editMeta.index;
//           if (!isSelf) return cls.name;
//         }
//       }
//     }
//     return null;
//   }, [formData, classes, editMode, editMeta, selectedClass]);

//   const handleOpenEditor = (cls, p = null, day = "", idx = null) => {
//     setSelectedClass(cls);
//     if (p) {
//       setEditMode(true);
//       setEditMeta({ index: idx, day });
//       setFormData({
//         day,
//         time: p.time,
//         subjectId: p.subjectId,
//         teacherId: p.teacher?._id || p.teacher,
//       });
//     } else {
//       setEditMode(false);
//       setFormData({ day: "", time: "", subjectId: "", teacherId: "" });
//     }
//     setIsOpen(true);
//   };

//   const savePeriod = async () => {
//     if (currentConflict)
//       return toast.error(`Conflict! Teacher is busy in ${currentConflict}`);
//     const subjectName = subjects.find(
//       (s) => s._id === formData.subjectId
//     )?.name;
//     try {
//       const url = editMode
//         ? `/api/academics/timetable/${selectedClass._id}`
//         : "/api/academics/timetable";
//       const method = editMode ? "PATCH" : "POST";
//       let payload;
//       if (editMode) {
//         payload = {
//           ...formData,
//           subjectName,
//           teacher: formData.teacherId,
//           index: editMeta.index,
//           day: editMeta.day,
//         };
//       } else {
//         const sch = structuredClone(selectedClass.schedule || []);
//         let d = sch.find((x) => x.day === formData.day);
//         if (!d) {
//           d = { day: formData.day, periods: [] };
//           sch.push(d);
//         }
//         d.periods.push({
//           ...formData,
//           subjectName,
//           teacher: formData.teacherId,
//         });
//         payload = { classId: selectedClass._id, schedule: sch };
//       }
//       await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       toast.success("Schedule Updated");
//       setIsOpen(false);
//       mutate();
//     } catch (e) {
//       toast.error("Update failed");
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
//       <div className="flex justify-between items-center print:hidden">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//             Academic Control Center
//           </h1>
//           <p className="text-sm text-indigo-600 font-bold">
//             2026 Academic Session
//           </p>
//         </div>
//         <Button
//           onClick={handlePrint}
//           variant="outline"
//           className="rounded-2xl font-black gap-2 border-2 hover:bg-slate-50 shadow-sm"
//         >
//           <Printer className="w-4 h-4" /> Print Reports
//         </Button>
//         {globalConflicts.length > 0 && (
//           <Badge className="bg-rose-600 text-white animate-pulse px-4 py-2 rounded-full border-none font-bold">
//             <ShieldAlert className="w-4 h-4 mr-2" /> {globalConflicts.length}{" "}
//             Conflicts
//           </Badge>
//         )}
//       </div>

//       <Tabs defaultValue="grid" className="w-full">
//         <TabsList className="bg-slate-100 border p-1 rounded-2xl mb-8 shadow-inner flex-wrap h-auto">
//           <TabsTrigger
//             value="grid"
//             className="rounded-xl px-5 py-2.5 gap-2 font-bold"
//           >
//             <LayoutGrid className="w-4 h-4" /> Weekly Grid
//           </TabsTrigger>
//           <TabsTrigger
//             value="daily"
//             className="rounded-xl px-5 py-2.5 gap-2 font-bold"
//           >
//             <Calendar className="w-4 h-4" /> Daily Glance
//           </TabsTrigger>
//           <TabsTrigger
//             value="workload"
//             className="rounded-xl px-5 py-2.5 gap-2 font-bold"
//           >
//             <BarChart3 className="w-4 h-4" /> Workload
//           </TabsTrigger>
//           <TabsTrigger
//             value="conflicts"
//             className="rounded-xl px-5 py-2.5 gap-2 font-bold text-rose-600 active:bg-rose-100"
//           >
//             <ShieldAlert className="w-4 h-4" /> Conflicts
//           </TabsTrigger>
//         </TabsList>

//         {/* --- GRID VIEW --- */}
//         <TabsContent value="grid" className="space-y-10">
//           {classes.map((cls) => (
//             <div
//               key={cls._id}
//               className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl shadow-slate-200/50 overflow-hidden"
//             >
//               <div className="bg-blue-900 px-8 py-5 flex justify-between items-center">
//                 <h2 className="text-lg font-black text-white tracking-widest uppercase">
//                   {cls.name}
//                 </h2>
//                 <Button
//                   onClick={() => handleOpenEditor(cls)}
//                   size="sm"
//                   className="rounded-full bg-slate-900 hover:bg-indigo-400 font-bold px-6 border-none"
//                 >
//                   <Plus className="w-4 h-4 mr-2" /> New Entry
//                 </Button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-6 divide-x-2 divide-slate-50">
//                 {WEEKDAYS.map((day) => {
//                   const dayData = cls.schedule?.find((s) => s.day === day);
//                   return (
//                     <div key={day} className="p-4 bg-white">
//                       <p className="text-[14px] font-black text-slate-900 uppercase mb-4 text-center tracking-tighter">
//                         {day}
//                       </p>
//                       <div className="space-y-3">
//                         {dayData?.periods.map((p, idx) => (
//                           <div
//                             key={idx}
//                             className="group p-3 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-500 rounded-2xl transition-all shadow-sm"
//                           >
//                             <div className="flex justify-between items-start mb-1">
//                               <span className="text-[12px] font-black text-indigo-600">
//                                 {p.time.split(" - ")[0]}
//                               </span>
//                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <button
//                                   onClick={() =>
//                                     handleOpenEditor(cls, p, day, idx)
//                                   }
//                                   className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"
//                                 >
//                                   <Edit3 className="w-3 h-3" />
//                                 </button>
//                                 <button
//                                   onClick={() => deletePeriod(cls, day, idx)}
//                                   className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
//                                 >
//                                   <Trash2 className="w-3 h-3" />
//                                 </button>
//                               </div>
//                             </div>
//                             <h4 className="text-[13px] font-black text-slate-800 leading-tight">
//                               {p.subjectName}
//                             </h4>
//                             <p className="text-[11px] font-bold text-slate-500 mt-1">
//                               {
//                                 teachers.find(
//                                   (t) => t._id === (p.teacher?._id || p.teacher)
//                                 )?.name
//                               }
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </TabsContent>

//         {/* --- FIXED DAILY GLANCE --- */}
//         <TabsContent value="daily">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {classes.map((cls) => {
//               const todayName = WEEKDAYS[new Date().getDay() - 1] || "Monday";
//               const todayPeriods =
//                 cls.schedule?.find((s) => s.day === todayName)?.periods || [];
//               return (
//                 <div
//                   key={cls._id}
//                   className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-lg shadow-slate-100"
//                 >
//                   <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-lg font-black text-slate-900">
//                       {cls.name}
//                     </h3>
//                     <Badge className="bg-indigo-100 text-indigo-700 font-bold">
//                       {todayName}
//                     </Badge>
//                   </div>
//                   <div className="space-y-4">
//                     {todayPeriods.length > 0 ? (
//                       todayPeriods.map((p, i) => (
//                         <div
//                           key={i}
//                           className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-600"
//                         >
//                           <div className="text-[11px] font-black text-indigo-600 w-12">
//                             {p.time.split(" - ")[0]}
//                           </div>
//                           <div>
//                             <p className="text-sm font-black text-slate-800 leading-none">
//                               {p.subjectName}
//                             </p>
//                             <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tight">
//                               {
//                                 teachers.find(
//                                   (t) => t._id === (p.teacher?._id || p.teacher)
//                                 )?.name
//                               }
//                             </p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-10 text-slate-400 font-bold italic">
//                         No schedule for {todayName}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </TabsContent>

//         {/* --- WORKLOAD --- */}
//         <TabsContent value="workload">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {teachers.map((t) => {
//               const count = teacherWorkload[t._id] || 0;
//               const isOver = count > 15;
//               return (
//                 <div
//                   key={t._id}
//                   className={`p-5 rounded-3xl border-2 transition-all ${
//                     isOver
//                       ? "bg-rose-50 border-rose-200"
//                       : "bg-white border-slate-100 shadow-sm"
//                   }`}
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
//                       {t.name.charAt(0)}
//                     </div>
//                     <Badge className={isOver ? "bg-rose-600" : "bg-indigo-600"}>
//                       {count} Slots
//                     </Badge>
//                   </div>
//                   <h4 className="text-md font-black text-slate-900">
//                     {t.name}
//                   </h4>
//                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
//                     {t.subject || "Faculty"}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </TabsContent>

//         {/* --- CONFLICTS LIST --- */}
//         <TabsContent value="conflicts">
//           <div className="bg-white rounded-3xl border-2 border-slate-50 shadow-xl p-8">
//             {globalConflicts.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {globalConflicts.map((conf, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-5 bg-rose-50 rounded-2xl border-2 border-rose-100"
//                   >
//                     <div className="flex gap-4 items-center">
//                       <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
//                         <ShieldAlert />
//                       </div>
//                       <div>
//                         <p className="text-sm font-black text-rose-900">
//                           {conf.teacher}
//                         </p>
//                         <p className="text-xs font-bold text-rose-700">
//                           {conf.day} | {conf.time}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-end gap-1">
//                       <Badge className="bg-rose-600">{conf.classA}</Badge>
//                       <Badge className="bg-rose-600">{conf.classB}</Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center py-20 text-emerald-500">
//                 <CheckCircle2 className="w-16 h-16 mb-4" />
//                 <p className="text-xl font-black">All Clear!</p>
//               </div>
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>

//       {/* --- EDITOR DIALOG --- */}
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
//           <div className="bg-slate-900 p-8 text-white">
//             <DialogTitle className="text-xl font-black">
//               {editMode ? "Edit Session" : "Assign Session"}
//             </DialogTitle>
//             <p className="text-indigo-400 text-xs font-black mt-1 uppercase tracking-widest">
//               {selectedClass?.name}
//             </p>
//           </div>
//           <div className="p-8 space-y-6 bg-white">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                   Day
//                 </label>
//                 <Select
//                   value={formData.day}
//                   onValueChange={(v) => setFormData({ ...formData, day: v })}
//                 >
//                   <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {WEEKDAYS.map((d) => (
//                       <SelectItem key={d} value={d} className="font-bold">
//                         {d}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                   Time
//                 </label>
//                 <Select
//                   value={formData.time}
//                   onValueChange={(v) => setFormData({ ...formData, time: v })}
//                 >
//                   <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {TIME_SLOTS.map((t) => (
//                       <SelectItem key={t} value={t} className="font-bold">
//                         {t}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                 Subject
//               </label>
//               <Select
//                 value={formData.subjectId}
//                 onValueChange={(v) =>
//                   setFormData({ ...formData, subjectId: v })
//                 }
//               >
//                 <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {subjects.map((s) => (
//                     <SelectItem key={s._id} value={s._id} className="font-bold">
//                       {s.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                 Teacher
//               </label>
//               <Select
//                 value={formData.teacherId}
//                 onValueChange={(v) =>
//                   setFormData({ ...formData, teacherId: v })
//                 }
//               >
//                 <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {teachers.map((t) => (
//                     <SelectItem key={t._id} value={t._id} className="font-bold">
//                       {t.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             {currentConflict && (
//               <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3">
//                 <AlertTriangle className="w-5 h-5 text-rose-600" />
//                 <p className="text-xs text-rose-700 font-black tracking-tight">
//                   Teacher Busy in {currentConflict}
//                 </p>
//               </div>
//             )}
//           </div>
//           <DialogFooter className="p-8 bg-slate-50">
//             <Button
//               variant="ghost"
//               onClick={() => setIsOpen(false)}
//               className="font-black text-slate-400"
//             >
//               Cancel
//             </Button>
//             <Button
//               disabled={!!currentConflict}
//               onClick={savePeriod}
//               className="rounded-2xl px-10 bg-slate-900 font-black h-12 shadow-lg shadow-slate-200"
//             >
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  LayoutGrid,
  Calendar,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  Printer,
  Clock,
  BookOpen,
  GraduationCap,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { PrintableGrid } from "./PrintableGrid";

const fetcher = (url) => fetch(url).then((res) => res.json());

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00 - 08:40",
  "08:40 - 09:20",
  "09:20 - 10:00",
  "10:00 - 10:40",
  "11:00 - 11:40",
  "11:40 - 12:20",
  "12:20 - 01:00",
];

export function TimetableContent() {
  const { data, mutate } = useSWR("/api/academics/timetable", fetcher);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    day: "",
    time: "",
    subjectId: "",
    teacherId: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editMeta, setEditMeta] = useState({ index: null, day: "" });

  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];
  const classes = data?.data || [];

  const handlePrint = () => window.print();

  const deletePeriod = async (cls, day, index) => {
    if (!confirm("Are you sure you want to delete this period?")) return;
    try {
      const sch = structuredClone(cls.schedule || []);
      const dayData = sch.find((x) => x.day === day);
      if (dayData) {
        dayData.periods.splice(index, 1);
        const res = await fetch(`/api/academics/timetable/${cls._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: sch }),
        });
        if (res.ok) {
          toast.success("Period removed");
          mutate();
        }
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const teacherWorkload = useMemo(() => {
    const stats = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods.forEach((p) => {
          const tId = p.teacher?._id || p.teacher;
          if (tId) stats[tId] = (stats[tId] || 0) + 1;
        });
      });
    });
    return stats;
  }, [classes]);

  const globalConflicts = useMemo(() => {
    const conflicts = [];
    const scheduleMap = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods.forEach((p) => {
          const tId = p.teacher?._id || p.teacher;
          if (!tId) return;
          const key = `${day.day}-${p.time}-${tId}`;
          if (scheduleMap[key]) {
            conflicts.push({
              teacher: teachers.find((t) => t._id === tId)?.name || "Unknown",
              day: day.day,
              time: p.time,
              classA: scheduleMap[key].className,
              classB: cls.name,
            });
          } else {
            scheduleMap[key] = { className: cls.name };
          }
        });
      });
    });
    return conflicts;
  }, [classes, teachers]);

  const currentConflict = useMemo(() => {
    if (
      !formData.day ||
      !formData.time ||
      !formData.teacherId ||
      !classes.length
    )
      return null;
    for (const cls of classes) {
      const daySchedule = cls.schedule?.find((s) => s.day === formData.day);
      if (daySchedule) {
        const periodIdx = daySchedule.periods.findIndex(
          (p) =>
            p.time === formData.time &&
            (p.teacher?._id === formData.teacherId ||
              p.teacher === formData.teacherId),
        );
        if (periodIdx !== -1) {
          const isSelf =
            editMode &&
            cls._id === selectedClass?._id &&
            formData.day === editMeta.day &&
            periodIdx === editMeta.index;
          if (!isSelf) return cls.name;
        }
      }
    }
    return null;
  }, [formData, classes, editMode, editMeta, selectedClass]);

  const handleOpenEditor = (cls, p = null, day = "", idx = null) => {
    setSelectedClass(cls);
    if (p) {
      setEditMode(true);
      setEditMeta({ index: idx, day });
      setFormData({
        day,
        time: p.time,
        subjectId: p.subjectId,
        teacherId: p.teacher?._id || p.teacher,
      });
    } else {
      setEditMode(false);
      setFormData({ day: "", time: "", subjectId: "", teacherId: "" });
    }
    setIsOpen(true);
  };

  const savePeriod = async () => {
    if (currentConflict)
      return toast.error(`Conflict! Teacher is busy in ${currentConflict}`);
    const subjectName = subjects.find(
      (s) => s._id === formData.subjectId,
    )?.name;
    try {
      const url = editMode
        ? `/api/academics/timetable/${selectedClass._id}`
        : "/api/academics/timetable";
      const method = editMode ? "PATCH" : "POST";
      let payload;
      if (editMode) {
        payload = {
          ...formData,
          subjectName,
          teacher: formData.teacherId,
          index: editMeta.index,
          day: editMeta.day,
        };
      } else {
        const sch = structuredClone(selectedClass.schedule || []);
        let d = sch.find((x) => x.day === formData.day);
        if (!d) {
          d = { day: formData.day, periods: [] };
          sch.push(d);
        }
        d.periods.push({
          ...formData,
          subjectName,
          teacher: formData.teacherId,
        });
        payload = { classId: selectedClass._id, schedule: sch };
      }
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Schedule Updated");
      setIsOpen(false);
      mutate();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const downloadClassPDF = (classId, className) => {
    const element = document.getElementById(`printable-card-${classId}`);
    const opt = {
      margin: 10,
      filename: `${className}_Timetable_2026.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }, // Landscape fits the grid better
    };

    // Run the conversion
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      {/* STYLE TAG FOR PRINT OPTIMIZATION */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            page-break-after: always !important;
            margin-bottom: 0 !important;
          }
          .print-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .time-col {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
          }
          .day-header {
            background-color: #1e293b !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Master Schedule Manager
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> Academic Session 2026 • Real-time
            Conflict Monitoring
          </p>
        </div>
        <div className="flex gap-3">
          {globalConflicts.length > 0 && (
            <Badge
              variant="destructive"
              className="animate-pulse px-4 py-2 rounded-xl text-sm font-bold"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> {globalConflicts.length}{" "}
              Conflicts Found
            </Badge>
          )}
          <Button
            onClick={handlePrint}
            className="rounded-xl font-black gap-2 bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 shadow-sm transition-all h-11"
          >
            <Printer className="w-4 h-4" /> Print Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="classic" className="w-full">
        <TabsList className="bg-slate-200/50 border p-1.5 rounded-2xl mb-8 shadow-sm print-hidden inline-flex">
          <TabsTrigger
            value="classic"
            className="rounded-xl px-6 py-2.5 gap-2 font-black data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <LayoutGrid className="w-4 h-4" /> Classic Grid
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="rounded-xl px-6 py-2.5 gap-2 font-black data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <LayoutGrid className="w-4 h-4" /> Master Grid
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="rounded-xl px-6 py-2.5 gap-2 font-black data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <Calendar className="w-4 h-4" /> Daily View
          </TabsTrigger>
          <TabsTrigger
            value="workload"
            className="rounded-xl px-6 py-2.5 gap-2 font-black data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <BarChart3 className="w-4 h-4" /> Workload Analytics
          </TabsTrigger>
          <TabsTrigger
            value="conflicts"
            className="rounded-xl px-6 py-2.5 gap-2 font-black text-rose-600 data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <ShieldAlert className="w-4 h-4" /> Conflict Tracker
          </TabsTrigger>
        </TabsList>

        {/* Inside your TabsContent grid */}
        <TabsContent value="classic">
          {classes.map((cls) => (
            <PrintableGrid
              key={cls._id}
              cls={cls}
              teachers={teachers}
              onDownload={downloadClassPDF}
              onAddPeriod={(c, p, d, t) => {
                // If coming from an empty slot, pre-fill the form
                if (d && t) setFormData({ ...formData, day: d, time: t });
                handleOpenEditor(c);
              }}
              onEditPeriod={handleOpenEditor}
              onDeletePeriod={deletePeriod}
            />
          ))}
        </TabsContent>

        <TabsContent value="grid" className="space-y-12">
          {classes.map((cls) => (
            <div
              key={cls._id}
              id={`printable-card-${cls._id}`} // ADD THIS LINE
              className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden print-card"
            >
              {/* CLASS HEADER */}
              <div className="bg-slate-900 px-10 py-6 flex justify-between items-center day-header">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <GraduationCap className="text-white w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                      {cls.name}
                    </h2>
                    <p className="text-indigo-300 text-xs font-bold mt-1 uppercase tracking-widest">
                      Weekly Academic Schedule
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => downloadClassPDF(cls._id, cls.name)}
                  variant="outline"
                  className="rounded-full bg-slate-800 text-white border-none hover:bg-indigo-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save PDF
                </Button>
                <Button
                  onClick={() => handleOpenEditor(cls)}
                  size="sm"
                  className="rounded-full bg-white text-slate-900 hover:bg-indigo-500 hover:text-white font-black px-6 transition-all print-hidden"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Period
                </Button>
              </div>

              {/* TIMETABLE MATRIX */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 bg-slate-50 border-b-2 border-r-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest w-40 time-col">
                        Time Slots
                      </th>
                      {WEEKDAYS.map((day) => (
                        <th
                          key={day}
                          className="p-5 bg-slate-50 border-b-2 border-r-2 border-slate-100 text-slate-800 font-black text-sm uppercase tracking-tighter"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time) => (
                      <tr key={time} className="group">
                        <td className="p-4 bg-slate-50/50 border-r-2 border-b-2 border-slate-100 font-black text-indigo-600 text-xs text-center time-col">
                          {time}
                        </td>
                        {WEEKDAYS.map((day) => {
                          const period = cls.schedule
                            ?.find((s) => s.day === day)
                            ?.periods.find((p) => p.time === time);
                          const idx = cls.schedule
                            ?.find((s) => s.day === day)
                            ?.periods.indexOf(period);

                          return (
                            <td
                              key={day}
                              className="p-2 border-r-2 border-b-2 border-slate-50 min-w-[180px] h-24 relative hover:bg-slate-50/80 transition-all"
                            >
                              {period ? (
                                <div className="h-full w-full p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm group/period relative overflow-hidden flex flex-col justify-center">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                  <h4 className="text-[13px] font-black text-slate-800 leading-tight mb-1">
                                    {period.subjectName}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <p className="text-[11px] font-bold truncate">
                                      {
                                        teachers.find(
                                          (t) =>
                                            t._id ===
                                            (period.teacher?._id ||
                                              period.teacher),
                                        )?.name
                                      }
                                    </p>
                                  </div>

                                  {/* ACTION BUTTONS */}
                                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/period:opacity-100 transition-opacity print-hidden">
                                    <button
                                      onClick={() =>
                                        handleOpenEditor(cls, period, day, idx)
                                      }
                                      className="p-1.5 bg-slate-100 hover:bg-indigo-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        deletePeriod(cls, day, idx)
                                      }
                                      className="p-1.5 bg-slate-100 hover:bg-rose-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center group/empty">
                                  <Plus
                                    className="w-5 h-5 text-slate-100 group-hover/empty:text-slate-300 cursor-pointer transition-colors print-hidden"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        day,
                                        time,
                                      }));
                                      handleOpenEditor(cls);
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* --- DAILY GLANCE --- */}
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => {
              const todayName = WEEKDAYS[new Date().getDay() - 1] || "Monday";
              const todayPeriods =
                cls.schedule?.find((s) => s.day === todayName)?.periods || [];
              return (
                <div
                  key={cls._id}
                  className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-100 group hover:border-indigo-200 transition-all"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                        {cls.name}
                      </h3>
                      <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">
                        {todayName}'s Agenda
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <BookOpen className="text-slate-400 group-hover:text-indigo-600 w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {todayPeriods.length > 0 ? (
                      todayPeriods
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((p, i) => (
                          <div
                            key={i}
                            className="flex gap-4 items-center p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent hover:border-white hover:bg-white hover:shadow-lg transition-all"
                          >
                            <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                              {p.time.split(" - ")[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-800 leading-none truncate">
                                {p.subjectName}
                              </p>
                              <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase truncate tracking-tight">
                                {
                                  teachers.find(
                                    (t) =>
                                      t._id === (p.teacher?._id || p.teacher),
                                  )?.name
                                }
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold italic">
                        No scheduled classes today
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* --- WORKLOAD --- */}
        <TabsContent value="workload">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((t) => {
              const count = teacherWorkload[t._id] || 0;
              const isOver = count > 15;
              return (
                <div
                  key={t._id}
                  className={`p-6 rounded-[2rem] border-2 transition-all group ${
                    isOver
                      ? "bg-rose-50 border-rose-200"
                      : "bg-white border-slate-100 shadow-sm hover:border-indigo-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {t.name.charAt(0)}
                    </div>
                    <Badge
                      className={`px-4 py-1.5 rounded-xl font-black ${isOver ? "bg-rose-600 shadow-lg shadow-rose-200" : "bg-indigo-600 shadow-lg shadow-indigo-100"}`}
                    >
                      {count} Periods
                    </Badge>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                    {t.subject || "General Faculty"}
                  </p>

                  <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isOver ? "bg-rose-500" : "bg-indigo-500"}`}
                      style={{ width: `${(count / 25) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* --- CONFLICTS LIST --- */}
        <TabsContent value="conflicts">
          <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-2xl p-10">
            {globalConflicts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {globalConflicts.map((conf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-6 bg-rose-50 rounded-[2rem] border-2 border-rose-100 relative overflow-hidden group hover:bg-rose-100/50 transition-colors"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                    <div className="flex gap-5 items-center">
                      <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-rose-900 leading-tight">
                          {conf.teacher}
                        </p>
                        <p className="text-sm font-bold text-rose-700/70 mt-1 uppercase tracking-tighter">
                          {conf.day} • {conf.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-rose-600 font-black px-4">
                        {conf.classA}
                      </Badge>
                      <div className="h-4 w-px bg-rose-200 mr-4" />
                      <Badge className="bg-rose-600 font-black px-4">
                        {conf.classB}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-24 text-emerald-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">
                  Conflict-Free Zone
                </h3>
                <p className="text-slate-500 font-bold mt-2">
                  All teacher assignments are perfectly synchronized.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* EDITOR DIALOG - Styled for Elegance */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              {editMode ? (
                <Edit3 className="text-indigo-400" />
              ) : (
                <Plus className="text-indigo-400" />
              )}
              {editMode ? "Refine Session" : "Schedule New"}
            </DialogTitle>
            <p className="text-indigo-400 text-xs font-black mt-2 uppercase tracking-[0.2em]">
              {selectedClass?.name}
            </p>
          </div>

          <div className="p-10 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Day of Week
                </label>
                <Select
                  value={formData.day}
                  onValueChange={(v) => setFormData({ ...formData, day: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 font-black">
                    {WEEKDAYS.map((d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        className="rounded-xl py-3 cursor-pointer"
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Time Slot
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => setFormData({ ...formData, time: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 font-black">
                    {TIME_SLOTS.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="rounded-xl py-3 cursor-pointer"
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Subject Matter
              </label>
              <Select
                value={formData.subjectId}
                onValueChange={(v) =>
                  setFormData({ ...formData, subjectId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 font-black">
                  {subjects.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="rounded-xl py-3 cursor-pointer"
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Assigned Faculty
              </label>
              <Select
                value={formData.teacherId}
                onValueChange={(v) =>
                  setFormData({ ...formData, teacherId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                  <SelectValue placeholder="Assign Teacher" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 font-black">
                  {teachers.map((t) => (
                    <SelectItem
                      key={t._id}
                      value={t._id}
                      className="rounded-xl py-3 cursor-pointer"
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentConflict && (
              <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                <p className="text-xs text-rose-700 font-black tracking-tight leading-relaxed">
                  Resource Conflict: Teacher is already assigned to{" "}
                  <span className="underline">{currentConflict}</span> during
                  this slot.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="p-10 bg-slate-50 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl font-black text-slate-400 h-14 px-8"
            >
              Discard
            </Button>
            <Button
              disabled={
                !!currentConflict ||
                !formData.day ||
                !formData.time ||
                !formData.subjectId ||
                !formData.teacherId
              }
              onClick={savePeriod}
              className="rounded-2xl px-12 bg-slate-900 font-black h-14 shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all"
            >
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
