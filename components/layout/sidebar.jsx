"use client";

import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  Search,
  LogOut,
  X,
  Archive,
} from "lucide-react";
import { Input } from "../ui/input";

/* =====================================================
   FULL NAVIGATION (RESTORED + ROLE BASED)
===================================================== */

const navigation = [
  {
    name: "Admin",
    icon: Shield,
    roles: ["admin"],
    children: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Topics Performance", href: "/dashboard/topic-performance" },
      { name: "Users", href: "/admin/users" },
      { name: "Risk Dashboard", href: "/dashboard/risk" },
      { name: "Analytics", href: "/analytics" },
      { name: "Academic Year", href: "/admin/academic-year" },
    ],
  },

  {
    name: "Students",
    icon: GraduationCap,
    roles: ["admin", "teacher"],
    children: [
      {
        name: "Dashboard",
        href: "/students/dashboard",
        roles: ["admin", "teacher"],
      },
      {
        name: "Student Dashboard",
        href: "/dashboard/student",
        roles: ["admin", "teacher"],
      },
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
    name: "Attendance",
    icon: UserCheck,
    roles: ["admin", "teacher"],
    children: [
      { name: "Student Attendance", href: "/attendance/students" },
      { name: "Teacher Attendance", href: "/attendance/teachers" },
      { name: "Reports", href: "/attendance/reports" },
      { name: "Student Register", href: "/attendance/register/print" },
      { name: "Teacher Register", href: "/attendance/teacher-register/print" },
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
      { name: "Date Sheet", href: "/exams/datesheet" },
      { name: "Award Lists", href: "/exams/award-list" },
      { name: "Roll Number Slips", href: "/exams/roll-slips" },
      { name: "Bulk Marks Entry", href: "/exams/bulk-mark-entry" },
      { name: "Bulk Subjects Entry", href: "/exams/bulk-subject-entry" },
    ],
  },

  {
    name: "Results",
    icon: BarChart3,
    // href: "/results",
    roles: ["admin", "teacher", "student"],
    children: [
      { name: "All Results", href: "/results" },
      { name: "Result Cards", href: "/results/result-cards" },
      { name: "Results", href: "/exams/results" },
      { name: "DMC", href: "/exams/dmc" },
      { name: "Print Result Cards", href: "/results/print" },
      { name: "Sudents Sujects Result", href: "/results/result-ledger" },
    ],
  },

  {
    name: "Downloads",
    icon: Download,
    roles: ["admin", "teacher", "student"],
    children: [
      { name: "Results", href: "/downloads/results" },
      { name: "Marksheets", href: "/downloads/marksheets" },
      { name: "Exams", href: "/downloads/exams" },
    ],
  },

  {
    name: "Promotion",
    icon: Users,
    roles: ["admin"],
    children: [
      { name: "Promote Students", href: "/promotion" },
      // { name: "Restore Students", href: "/promotion/restore" },
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
      { name: "Generate Worksheets", href: "/ai/worksheet" },
      { name: "Auto Marking", href: "/ai/grader" },
    ],
  },

  {
    name: "Download",
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
    children: [
      // { name: "Attendance", href: "/reports/attendance" },
      // { name: "Exams", href: "/reports/exams" },
      // { name: "Results", href: "/reports/results" },
      { name: "Reports", href: "/reports" },
    ],
  },

  {
    name: "Notifications",
    icon: Bell,
    href: "/notifications",
    roles: ["admin", "teacher", "student", "parent"],
    children: [
      { name: "All Notifications", href: "/notifications" },
      { name: "Create Notification", href: "/notifications/create" },
    ],
  },

  {
    name: "See Archives",
    icon: Archive, // Ensure you import { Archive } from "lucide-react"
    roles: ["admin", "teacher"],
    children: [
      { name: "Archives Management", href: "/archives/management" },
      { name: "Past Exams", href: "/archives/exams/view" },
      { name: "Historical Results", href: "/archives/results/view" },
      { name: "Past Attendance", href: "/archives/attendance/view" },
      { name: "Graduated Students", href: "/archives/students/view" },
    ],
  },
  {
    name: "Make Archives",
    icon: Archive,
    roles: ["admin", "teacher"],
    children: [
      { name: "Exams", href: "/archives/exams" },
      { name: "Results", href: "/archives/results" },
      { name: "Attendance", href: "/archives/attendance" },
      { name: "Students", href: "/archives/students" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["admin", "teacher", "student", "parent"],
    children: [
      { name: "Profile", href: "/settings/profile" },
      // { name: "Change Password", href: "/settings/password" },
      { name: "Settings", href: "/settings" },
    ],
  },
];

function NavItem({ item, pathname, searchActive }) {
  const key = `sidebar-open-${item.name}`;
  const isActive =
    item.href === pathname ||
    item.children?.some((c) => pathname.startsWith(c.href));

  // Auto-expand if searching or if active
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (searchActive || isActive) setOpen(true);
  }, [searchActive, isActive]);

  const Icon = item.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-zinc-800/80 text-white"
            : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive
                ? "text-blue-500"
                : "text-zinc-500 group-hover:text-zinc-300",
            )}
          />
          <span>{item.name}</span>
        </div>
        {item.children && (
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200 opacity-40",
              !open && "-rotate-90",
            )}
          />
        )}
      </button>

      {open && item.children && (
        <div className="ml-4 mt-1 space-y-1 border-l border-zinc-800/60 pl-4">
          {item.children.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                "block rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                pathname === c.href
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const role = session?.user?.role || "admin";

  // Filter items based on Role AND Search Query
  const filteredItems = useMemo(() => {
    return navigation
      .filter((n) => n.roles.includes(role))
      .map((n) => {
        const filteredChildren = n.children?.filter(
          (c) =>
            (!c.roles || c.roles.includes(role)) &&
            c.name?.toLowerCase().includes(searchQuery?.toLowerCase()),
        );

        // If parent name matches or has matching children, keep it
        if (
          n.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (filteredChildren && filteredChildren.length > 0)
        ) {
          return { ...n, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  }, [role, searchQuery]);

  return (
    <>
      {/* Desktop Sidebar */}
      {/* <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-[#0c0c0e] border-r border-zinc-800/50 z-40"> */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col 
  bg-[#0c0c0e] bg-[radial-gradient(circle_at_20%_30%,_rgba(40,40,45,0.3)_0%,_transparent_50%)] 
  border-r border-zinc-800/50 z-40"
      >
        <SidebarContent
          pathname={pathname}
          items={filteredItems}
          user={session?.user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </aside>

      {/* Mobile Wrapper */}
      <div className="lg:hidden print:hidden fixed top-0 left-0 right-0 h-14 flex items-center px-4 bg-[#0c0c0e] border-b border-zinc-800 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="text-zinc-400">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-[#0c0c0e] border-zinc-800"
          >
            <SidebarContent
              pathname={pathname}
              items={filteredItems}
              user={session?.user}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex items-center gap-2">
          <School className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-sm text-white uppercase tracking-wider">
            EduManage
          </span>
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  pathname,
  items,
  user,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* 1. Header & Search (Fixed) */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
            <School className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-black text-lg text-white tracking-tight uppercase italic">
            Edu<span className="text-blue-500">Manage</span>
          </h1>
        </div>

        <div className="relative group px-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search menus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-xs h-9 focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        <nav className="space-y-1 pb-10">
          {items.length > 0 ? (
            items.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                pathname={pathname}
                searchActive={searchQuery.length > 0}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-zinc-600 font-medium">
                No menus found
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* 3. User Footer (Fixed) */}
      <div className="p-4 bg-zinc-900/20 border-t border-zinc-800/50 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
            {user?.name?.[0] || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-zinc-100 truncate leading-tight">
              {user?.name || "Admin User"}
            </p>
            <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-tighter">
              {user?.role || "Administrator"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
