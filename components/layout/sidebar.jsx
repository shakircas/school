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
      { name: "Dashboard", href: "/dashboard" },
      { name: "Users", href: "/admin/users" },
      { name: "Analytics", href: "/analytics" },
    ],
  },

  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "teacher", "student", "parent"],
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
      { name: "Register", href: "/attendance/register" },
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
    <div className="flex flex-col h-screen ">
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
