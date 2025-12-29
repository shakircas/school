// // "use client";

// // import { useState } from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import { cn } from "@/lib/utils";
// // import { Button } from "@/components/ui/button";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// // import {
// //   LayoutDashboard,
// //   Users,
// //   GraduationCap,
// //   UserCheck,
// //   ClipboardList,
// //   BookOpen,
// //   FileQuestion,
// //   FileText,
// //   DollarSign,
// //   BarChart3,
// //   Download,
// //   Settings,
// //   Menu,
// //   ChevronDown,
// //   ChevronRight,
// //   Brain,
// //   Bell,
// //   BookOpenCheck,
// //   School,
// // } from "lucide-react";

// // const navigation = [
// //   {
// //     name: "Dashboard",
// //     href: "/",
// //     icon: LayoutDashboard,
// //   },
// //   {
// //     name: "Students",
// //     icon: GraduationCap,
// //     children: [
// //       { name: "All Students", href: "/students" },
// //       { name: "Add Student", href: "/students/add" },
// //       { name: "Admissions", href: "/students/admissions" },
// //       { name: "Withdrawals", href: "/students/withdrawals" },
// //     ],
// //   },
// //   {
// //     name: "Teachers",
// //     icon: Users,
// //     children: [
// //       { name: "All Teachers", href: "/teachers" },
// //       { name: "Add Teacher", href: "/teachers/add" },
// //     ],
// //   },
// //   {
// //     name: "Attendance",
// //     icon: UserCheck,
// //     children: [
// //       { name: "Student Attendance", href: "/attendance/students" },
// //       { name: "Teacher Attendance", href: "/attendance/teachers" },
// //       { name: "Reports", href: "/attendance/reports" },
// //     ],
// //   },
// //   {
// //     name: "Academics",
// //     icon: BookOpen,
// //     children: [
// //       { name: "Classes", href: "/academics/classes" },
// //       { name: "Subjects", href: "/academics/subjects" },
// //       { name: "Timetable", href: "/academics/timetable" },
// //       { name: "Teacher Timetable", href: "/academics/teacher-timetable" },
// //       { name: "Timetable Builder", href: "/academics/timetable-builder" },
// //     ],
// //   },
// //   {
// //     name: "Examinations",
// //     icon: ClipboardList,
// //     children: [
// //       { name: "Exams", href: "/exams" },
// //       { name: "Results", href: "/exams/results" },
// //       { name: "DMC", href: "/exams/dmc" },
// //       { name: "Roll Number Slips", href: "/exams/roll-slips" },
// //     ],
// //   },
// //   {
// //     name: "Quizzes",
// //     icon: BookOpenCheck,
// //     children: [
// //       { name: "All Quizzes", href: "/quizzes" },
// //       { name: "Create Quiz", href: "/quizzes/create" },
// //       { name: "Quiz Attempts", href: "/quizzes/attempts" },
// //       { name: "Quiz Results", href: "/analytics" },
// //     ],
// //   },
// //   {
// //     name: "MCQ Practice",
// //     icon: FileQuestion,
// //     children: [
// //       { name: "Question Bank", href: "/mcqs" },
// //       { name: "Add Questions", href: "/mcqs/add" },
// //       { name: "Practice Tests", href: "/mcqs/practice" },
// //     ],
// //   },
// //   {
// //     name: "Assignments",
// //     icon: FileText,
// //     children: [
// //       { name: "All Assignments", href: "/assignments" },
// //       { name: "Create Assignment", href: "/assignments/create" },
// //     ],
// //   },
// //   {
// //     name: "Fee Management",
// //     icon: DollarSign,
// //     children: [
// //       { name: "Fee Collection", href: "/fees" },
// //       { name: "Fee Structure", href: "/fees/structure" },
// //       { name: "Pending Fees", href: "/fees/pending" },
// //       { name: "Reports", href: "/fees/reports" },
// //     ],
// //   },
// //   {
// //     name: "AI Assistant",
// //     icon: Brain,
// //     children: [
// //       { name: "Generate Papers", href: "/ai/papers" },
// //       { name: "Generate Notes", href: "/ai/notes" },
// //       { name: "Generate MCQs", href: "/ai/mcqs" },
// //       { name: "Auto Marking", href: "/ai/marking" },
// //     ],
// //   },
// //   {
// //     name: "Downloads",
// //     icon: Download,
// //     children: [
// //       { name: "Student Data", href: "/downloads/students" },
// //       { name: "Teacher Data", href: "/downloads/teachers" },
// //       { name: "Results & Reports", href: "/downloads/results" },
// //       { name: "Fee Reports", href: "/downloads/fees" },
// //     ],
// //   },
// //   {
// //     name: "Reports",
// //     icon: BarChart3,
// //     href: "/reports",
// //   },
// //   {
// //     name: "Notifications",
// //     icon: Bell,
// //     href: "/notifications",
// //   },
// //   {
// //     name: "Settings",
// //     icon: Settings,
// //     href: "/settings",
// //   },
// // ];

// // function NavItem({ item, pathname, collapsed }) {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const isActive =
// //     item.href === pathname ||
// //     item.children?.some((child) => child.href === pathname);
// //   const Icon = item.icon;

// //   if (item.children) {
// //     return (
// //       <div>
// //         <button
// //           onClick={() => setIsOpen(!isOpen)}
// //           className={cn(
// //             "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
// //             isActive
// //               ? "bg-sidebar-accent text-sidebar-accent-foreground"
// //               : "text-sidebar-foreground hover:bg-sidebar-accent/50"
// //           )}
// //         >
// //           <div className="flex items-center gap-3">
// //             <Icon className="h-5 w-5" />
// //             {!collapsed && <span>{item.name}</span>}
// //           </div>
// //           {!collapsed &&
// //             (isOpen ? (
// //               <ChevronDown className="h-4 w-4" />
// //             ) : (
// //               <ChevronRight className="h-4 w-4" />
// //             ))}
// //         </button>
// //         {isOpen && !collapsed && (
// //           <div className="ml-8 mt-1 space-y-1">
// //             {item.children.map((child) => (
// //               <Link
// //                 key={child.href}
// //                 href={child.href}
// //                 className={cn(
// //                   "block px-3 py-2 text-sm rounded-lg transition-colors",
// //                   pathname === child.href
// //                     ? "bg-sidebar-primary text-sidebar-primary-foreground"
// //                     : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
// //                 )}
// //               >
// //                 {child.name}
// //               </Link>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <Link
// //       href={item.href}
// //       className={cn(
// //         "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
// //         isActive
// //           ? "bg-sidebar-primary text-sidebar-primary-foreground"
// //           : "text-sidebar-foreground hover:bg-sidebar-accent/50"
// //       )}
// //     >
// //       <Icon className="h-5 w-5" />
// //       {!collapsed && <span>{item.name}</span>}
// //     </Link>
// //   );
// // }

// // function SidebarContent({ collapsed = false }) {
// //   const pathname = usePathname();

// //   return (
// //     <div className="flex flex-col h-full bg-sidebar">
// //       <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
// //         <School className="h-8 w-8 text-sidebar-primary" />
// //         {!collapsed && (
// //           <div>
// //             <h1 className="text-lg font-bold text-sidebar-foreground">
// //               EduManage
// //             </h1>
// //             <p className="text-xs text-sidebar-foreground/60">
// //               School Management
// //             </p>
// //           </div>
// //         )}
// //       </div>

// //       <ScrollArea className="flex-1 px-3 py-4">
// //         <nav className="space-y-1">
// //           {navigation.map((item) => (
// //             <NavItem
// //               key={item.name}
// //               item={item}
// //               pathname={pathname}
// //               collapsed={collapsed}
// //             />
// //           ))}
// //         </nav>
// //       </ScrollArea>
// //     </div>
// //   );
// // }

// // export function Sidebar() {
// //   return (
// //     <>
// //       {/* Desktop Sidebar */}
// //       <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-sidebar-border z-30">
// //         <SidebarContent />
// //       </aside>

// //       {/* Mobile Sidebar */}
// //       <Sheet>
// //         <SheetTrigger asChild>
// //           <Button
// //             variant="ghost"
// //             size="icon"
// //             className="lg:hidden fixed top-3 left-3 z-40"
// //           >
// //             <Menu className="h-6 w-6" />
// //           </Button>
// //         </SheetTrigger>
// //         <SheetContent side="left" className="p-0 w-64">
// //           <SidebarContent />
// //         </SheetContent>
// //       </Sheet>
// //     </>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import {
//   LayoutDashboard,
//   Users,
//   GraduationCap,
//   UserCheck,
//   ClipboardList,
//   BookOpen,
//   FileQuestion,
//   FileText,
//   DollarSign,
//   BarChart3,
//   Download,
//   Settings,
//   Menu,
//   ChevronDown,
//   ChevronRight,
//   Brain,
//   Bell,
//   BookOpenCheck,
//   School,
//   UserCog,
//   Shield,
//   PieChart,
//   Home,
// } from "lucide-react";

// /* =====================================================
//    NAVIGATION CONFIG (SINGLE SOURCE OF TRUTH)
// ===================================================== */

// const navigation = [
//   /* ================= ADMIN ================= */
//   {
//     name: "Admin",
//     icon: Shield,
//     roles: ["admin"],
//     children: [
//       { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
//       { name: "Users", href: "/admin/users", icon: Users },
//       { name: "Roles & Permissions", href: "/admin/roles", icon: UserCog },
//       { name: "System Analytics", href: "/admin/analytics", icon: PieChart },
//       { name: "Settings", href: "/admin/settings", icon: Settings },
//     ],
//   },

//   /* ================= DASHBOARD ================= */
//   {
//     name: "Dashboard",
//     href: "/",
//     icon: LayoutDashboard,
//     roles: ["admin", "teacher", "student", "parent"],
//   },

//   /* ================= STUDENTS ================= */
//   {
//     name: "Students",
//     icon: GraduationCap,
//     roles: ["admin", "teacher"],
//     children: [
//       { name: "All Students", href: "/students" },
//       { name: "Add Student", href: "/students/add" },
//       { name: "Admissions", href: "/students/admissions" },
//       { name: "Withdrawals", href: "/students/withdrawals" },
//     ],
//   },

//   /* ================= TEACHERS ================= */
//   {
//     name: "Teachers",
//     icon: Users,
//     roles: ["admin"],
//     children: [
//       { name: "All Teachers", href: "/teachers" },
//       { name: "Add Teacher", href: "/teachers/add" },
//     ],
//   },

//   /* ================= ATTENDANCE ================= */
//   {
//     name: "Attendance",
//     icon: UserCheck,
//     roles: ["admin", "teacher"],
//     children: [
//       { name: "Student Attendance", href: "/attendance/students" },
//       { name: "Teacher Attendance", href: "/attendance/teachers" },
//       { name: "Reports", href: "/attendance/reports" },
//     ],
//   },

//   /* ================= ACADEMICS ================= */
//   {
//     name: "Academics",
//     icon: BookOpen,
//     roles: ["admin", "teacher"],
//     children: [
//       { name: "Classes", href: "/academics/classes" },
//       { name: "Subjects", href: "/academics/subjects" },
//       { name: "Timetable", href: "/academics/timetable" },
//       { name: "Timetable Builder", href: "/academics/timetable-builder" },
//     ],
//   },

//   /* ================= EXAMS ================= */
//   {
//     name: "Examinations",
//     icon: ClipboardList,
//     roles: ["admin", "teacher"],
//     children: [
//       { name: "Exams", href: "/exams" },
//       { name: "Results", href: "/exams/results" },
//       { name: "DMC", href: "/exams/dmc" },
//       { name: "Roll Slips", href: "/exams/roll-slips" },
//     ],
//   },

//   /* ================= QUIZZES ================= */
//   {
//     name: "Quizzes",
//     icon: BookOpenCheck,
//     roles: ["admin", "teacher", "student"],
//     children: [
//       { name: "All Quizzes", href: "/quizzes" },
//       { name: "Practice", href: "/quizzes/practice" },
//       { name: "Attempts", href: "/quizzes/attempts" },
//       { name: "Results", href: "/analytics" },
//     ],
//   },

//   /* ================= MCQs ================= */
//   {
//     name: "MCQs",
//     icon: FileQuestion,
//     roles: ["admin", "teacher", "student"],
//     children: [
//       { name: "Question Bank", href: "/mcqs" },
//       { name: "Practice", href: "/mcqs/practice" },
//     ],
//   },

//   /* ================= AI ================= */
//   {
//     name: "AI Assistant",
//     icon: Brain,
//     roles: ["admin", "teacher"],
//     children: [
//       { name: "Generate Papers", href: "/ai/papers" },
//       { name: "Generate Notes", href: "/ai/notes" },
//       { name: "Generate MCQs", href: "/ai/mcqs" },
//     ],
//   },

//   /* ================= FEES ================= */
//   {
//     name: "Fee Management",
//     icon: DollarSign,
//     roles: ["admin"],
//     children: [
//       { name: "Collection", href: "/fees" },
//       { name: "Structure", href: "/fees/structure" },
//       { name: "Reports", href: "/fees/reports" },
//     ],
//   },

//   /* ================= PARENT ================= */
//   {
//     name: "Parent",
//     icon: Home,
//     roles: ["parent"],
//     children: [
//       { name: "Dashboard", href: "/parent" },
//       { name: "Attendance", href: "/parent/attendance" },
//       { name: "Results", href: "/parent/results" },
//       { name: "Fee Status", href: "/parent/fees" },
//     ],
//   },

//   /* ================= COMMON ================= */
//   {
//     name: "Notifications",
//     href: "/notifications",
//     icon: Bell,
//     roles: ["admin", "teacher", "student", "parent"],
//   },
//   {
//     name: "Settings",
//     href: "/settings",
//     icon: Settings,
//     roles: ["admin", "teacher", "student", "parent"],
//   },
// ];

// /* =====================================================
//    NAV ITEM
// ===================================================== */

// function NavItem({ item, pathname }) {
//   const [open, setOpen] = useState(false);
//   const Icon = item.icon;

//   if (item.children) {
//     return (
//       <div>
//         <button
//           onClick={() => setOpen(!open)}
//           className={cn(
//             "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
//             pathname.startsWith(item.href)
//               ? "bg-sidebar-accent"
//               : "hover:bg-sidebar-accent/50"
//           )}
//         >
//           <div className="flex items-center gap-3">
//             <Icon className="h-5 w-5" />
//             <span>{item.name}</span>
//           </div>
//           {open ? <ChevronDown /> : <ChevronRight />}
//         </button>

//         {open && (
//           <div className="ml-8 mt-1 space-y-1">
//             {item.children.map((c) => (
//               <Link
//                 key={c.href}
//                 href={c.href}
//                 className={cn(
//                   "block rounded-md px-3 py-2 text-sm",
//                   pathname === c.href
//                     ? "bg-sidebar-primary text-white"
//                     : "hover:bg-sidebar-accent/50"
//                 )}
//               >
//                 {c.name}
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <Link
//       href={item.href}
//       className={cn(
//         "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
//         pathname === item.href
//           ? "bg-sidebar-primary text-white"
//           : "hover:bg-sidebar-accent/50"
//       )}
//     >
//       <Icon className="h-5 w-5" />
//       {item.name}
//     </Link>
//   );
// }

// /* =====================================================
//    SIDEBAR
// ===================================================== */

// export function Sidebar() {
//   const pathname = usePathname();
//   const { data: session } = useSession();
//   const role = session?.user?.role || "admin"; // fallback during dev

//   const filteredNav = navigation.filter((item) => item.roles.includes(role));

//   return (
//     <>
//       <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r">
//         <SidebarContent pathname={pathname} items={filteredNav} />
//       </aside>

//       <Sheet>
//         <SheetTrigger asChild>
//           <Button
//             size="icon"
//             variant="ghost"
//             className="lg:hidden fixed top-3 left-3"
//           >
//             <Menu />
//           </Button>
//         </SheetTrigger>
//         <SheetContent side="left" className="p-0 w-64">
//           <SidebarContent pathname={pathname} items={filteredNav} />
//         </SheetContent>
//       </Sheet>
//     </>
//   );
// }

// function SidebarContent({ pathname, items }) {
//   return (
//     // <div className="flex h-full flex-col bg-sidebar">
//     //   <div className="flex items-center gap-2 px-4 py-4 border-b">
//     <div className="flex flex-col h-full bg-sidebar">
//       {" "}
//       <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
//         <School className="h-8 w-8 text-sidebar-primary" />
//         <School className="h-8 w-8" />
//         <div>
//           <h1 className="font-bold">EduManage</h1>
//           <p className="text-xs opacity-60">School System</p>
//         </div>
//       </div>
//       <ScrollArea className="flex-1 px-3 py-4">
//         <nav className="space-y-1">
//           {items.map((item) => (
//             <NavItem key={item.name} item={item} pathname={pathname} />
//           ))}
//         </nav>
//       </ScrollArea>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  ClipboardList,
  BookOpen,
  FileQuestion,
  FileText,
  DollarSign,
  BarChart3,
  Download,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  Brain,
  Bell,
  BookOpenCheck,
  School,
  Shield,
  UserCog,
  PieChart,
  Home,
} from "lucide-react";

/* =====================================================
   FULL NAVIGATION (RESTORED + ROLE BASED)
===================================================== */

const navigation = [
  {
    name: "Admin",
    icon: Shield,
    roles: ["admin"],
    children: [
      { name: "Dashboard", href: "/admin" },
      { name: "Users", href: "/admin/users" },
      { name: "Roles & Permissions", href: "/admin/roles" },
      { name: "System Analytics", href: "/admin/analytics" },
      { name: "Settings", href: "/admin/settings" },
    ],
  },

  //   {
  //   name: "Admin",
  //   icon: Shield,
  //   roles: ["admin"],
  //   children: [
  //     { name: "Dashboard", href: "/admin", roles: ["admin"] },
  //     { name: "Users", href: "/admin/users", roles: ["admin"] },
  //     { name: "Roles", href: "/admin/roles", roles: ["admin"] },
  //   ],
  // }

  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "teacher", "student", "parent"],
  },

  {
    name: "Students",
    icon: GraduationCap,
    roles: ["admin", "teacher"],
    children: [
      { name: "Dashboard", href: "/students/dashboard", roles: ["admin", "teacher"] },
      { name: "All Students", href: "/students" },
      { name: "Add Student", href: "/students/add" },
      { name: "Admissions", href: "/students/admissions" },
      { name: "Withdrawals", href: "/students/withdrawals" },
    ],
  },

  {
    name: "Teachers",
    icon: Users,
    roles: ["admin"],
    children: [
      { name: "All Teachers", href: "/teachers" },
      { name: "Add Teacher", href: "/teachers/add" },
    ],
  },

  {
    name: "Teacher",
    icon: Users,
    roles: ["teacher", "admin"],
    children: [
      { name: "Dashboard", href: "/teacher", roles: ["teacher", "admin"] },
      {
        name: "Create Quiz",
        href: "/teacher/quizzes/create",
        roles: ["teacher"],
      },
      { name: "MCQ Bank", href: "/mcqs", roles: ["teacher", "admin"] },
      {
        name: "Analytics",
        href: "/analytics",
        roles: ["teacher", "admin"],
      },
    ],
  },
  {
    name: "Attendance",
    icon: UserCheck,
    roles: ["admin", "teacher"],
    children: [
      { name: "Student Attendance", href: "/attendance/students" },
      { name: "Teacher Attendance", href: "/attendance/teachers" },
      { name: "Reports", href: "/attendance/reports" },
    ],
  },

  {
    name: "Academics",
    icon: BookOpen,
    roles: ["admin", "teacher"],
    children: [
      { name: "Classes", href: "/academics/classes" },
      { name: "Subjects", href: "/academics/subjects" },
      { name: "Timetable", href: "/academics/timetable" },
      { name: "Teacher Timetable", href: "/academics/teacher-timetable" },
      { name: "Timetable Builder", href: "/academics/timetable-builder" },
    ],
  },

  {
    name: "Examinations",
    icon: ClipboardList,
    roles: ["admin", "teacher"],
    children: [
      { name: "Exams", href: "/exams" },
      { name: "Results", href: "/exams/results" },
      { name: "DMC", href: "/exams/dmc" },
      { name: "Roll Number Slips", href: "/exams/roll-slips" },
    ],
  },

  {
    name: "Quizzes",
    icon: BookOpenCheck,
    roles: ["admin", "teacher", "student"],
    children: [
      { name: "All Quizzes", href: "/quizzes" },
      { name: "Create Quiz", href: "/quizzes/create" },
      { name: "Quiz Attempts", href: "/quizzes/attempts" },
      { name: "Quiz Results", href: "/analytics" },
    ],
  },

  {
    name: "MCQ Practice",
    icon: FileQuestion,
    roles: ["admin", "teacher", "student"],
    children: [
      { name: "Question Bank", href: "/mcqs" },
      { name: "Add Questions", href: "/mcqs/add" },
      { name: "Practice Tests", href: "/mcqs/practice" },
    ],
  },

  {
    name: "Assignments",
    icon: FileText,
    roles: ["admin", "teacher"],
    children: [
      { name: "All Assignments", href: "/assignments" },
      { name: "Create Assignment", href: "/assignments/create" },
    ],
  },

  {
    name: "Fee Management",
    icon: DollarSign,
    roles: ["admin"],
    children: [
      { name: "Fee Collection", href: "/fees" },
      { name: "Fee Structure", href: "/fees/structure" },
      { name: "Pending Fees", href: "/fees/pending" },
      { name: "Reports", href: "/fees/reports" },
    ],
  },

  {
    name: "AI Assistant",
    icon: Brain,
    roles: ["admin", "teacher"],
    children: [
      { name: "Generate Papers", href: "/ai/papers" },
      { name: "Generate Notes", href: "/ai/notes" },
      { name: "Generate MCQs", href: "/ai/mcqs" },
      { name: "Auto Marking", href: "/ai/marking" },
    ],
  },

  {
    name: "Downloads",
    icon: Download,
    roles: ["admin"],
    children: [
      { name: "Student Data", href: "/downloads/students" },
      { name: "Teacher Data", href: "/downloads/teachers" },
      { name: "Results & Reports", href: "/downloads/results" },
      { name: "Fee Reports", href: "/downloads/fees" },
    ],
  },

  {
    name: "Reports",
    icon: BarChart3,
    href: "/reports",
    roles: ["admin"],
  },

  {
    name: "Notifications",
    icon: Bell,
    href: "/notifications",
    roles: ["admin", "teacher", "student", "parent"],
  },

  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["admin", "teacher", "student", "parent"],
  },
];

/* =====================================================
   NAV ITEM
===================================================== */

// function NavItem({ item, pathname }) {
//   const closeSheet = () => {
//     document.body.click(); // closes Sheet
//   };
//   const isActive =
//     item.href === pathname ||
//     item.children?.some((c) => pathname.startsWith(c.href));

//   // 👇 auto open if active
//   const [open, setOpen] = useState(isActive);
//   const Icon = item.icon;

//   if (item.children) {
//     return (
//       <div>
//         <button
//           onClick={() => setOpen(!open)}
//           className={cn(
//             "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white",
//             isActive ? "bg-blue-600" : "hover:bg-white/10"
//           )}
//         >
//           <div className="flex items-center gap-3">
//             <Icon className="h-5 w-5" />
//             <span>{item.name}</span>
//           </div>
//           {open ? <ChevronDown /> : <ChevronRight />}
//         </button>

//         {open && (
//           <div className="ml-8 mt-1 space-y-1">
//             {item.children.map((c) => (
//               <Link
//                 key={c.href}
//                 href={c.href}
//                 onClick={closeSheet}
//                 className={cn(
//                   "block rounded-md px-3 py-2 text-sm text-white",
//                   pathname.startsWith(c.href)
//                     ? "bg-blue-500"
//                     : "hover:bg-white/10"
//                 )}
//               >
//                 {c.name}
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <Link
//       href={item.href}
//       className={cn(
//         "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white",
//         isActive ? "bg-blue-600" : "hover:bg-white/10"
//       )}
//     >
//       <Icon className="h-5 w-5" />
//       {item.name}
//     </Link>
//   );
// }

function NavItem({ item, pathname }) {
  const key = `sidebar-open-${item.name}`;
  const closeSheet = () => {
    document.body.click(); // closes Sheet
  };
  const isActive =
    item.href === pathname ||
    item.children?.some((c) => pathname.startsWith(c.href));

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return isActive;
    const saved = localStorage.getItem(key);
    return saved ? saved === "true" : isActive;
  });

  useEffect(() => {
    localStorage.setItem(key, open);
  }, [open]);

  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white",
            isActive ? "bg-blue-600" : "hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </div>
          {open ? <ChevronDown /> : <ChevronRight />}
        </button>

        {open && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={closeSheet}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm text-white",
                  pathname.startsWith(c.href)
                    ? "bg-blue-500"
                    : "hover:bg-white/10"
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* =====================================================
   SIDEBAR
===================================================== */

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "admin";

  // const items = navigation.filter((n) => n.roles.includes(role));
  const items = navigation
    .filter((n) => n.roles.includes(role))
    .map((n) => ({
      ...n,
      children: n.children?.filter((c) => !c.roles || c.roles.includes(role)),
    }));

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-black border-r border-white/10">
        <SidebarContent pathname={pathname} items={items} />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden fixed top-3 left-3 z-50 text-white bg-black/70 backdrop-blur"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-64 bg-black z-50">
          <SidebarContent pathname={pathname} items={items} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({ pathname, items }) {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <School className="h-8 w-8 text-blue-500" />
        <div className="text-white">
          <h1 className="font-bold text-lg">EduManage</h1>
          <p className="text-xs opacity-70">School Management System</p>
        </div>
      </div>

      {/* Scrollable menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavItem key={item.name} item={item} pathname={pathname} />
        ))}
      </nav>
    </div>
  );
}
