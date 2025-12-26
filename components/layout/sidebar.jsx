"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    icon: GraduationCap,
    children: [
      { name: "All Students", href: "/students" },
      { name: "Add Student", href: "/students/add" },
      { name: "Admissions", href: "/students/admissions" },
      { name: "Withdrawals", href: "/students/withdrawals" },
    ],
  },
  {
    name: "Teachers",
    icon: Users,
    children: [
      { name: "All Teachers", href: "/teachers" },
      { name: "Add Teacher", href: "/teachers/add" },
    ],
  },
  {
    name: "Attendance",
    icon: UserCheck,
    children: [
      { name: "Student Attendance", href: "/attendance/students" },
      { name: "Teacher Attendance", href: "/attendance/teachers" },
      { name: "Reports", href: "/attendance/reports" },
    ],
  },
  {
    name: "Academics",
    icon: BookOpen,
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
    children: [
      { name: "All Quizzes", href: "/quizzes" },
      { name: "Create Quiz", href: "/quizzes/create" },
      { name: "Quiz Results", href: "/quizzes/results" },
    ],
  },
  {
    name: "MCQ Practice",
    icon: FileQuestion,
    children: [
      { name: "Question Bank", href: "/mcqs" },
      { name: "Add Questions", href: "/mcqs/add" },
      { name: "Practice Tests", href: "/mcqs/practice" },
    ],
  },
  {
    name: "Assignments",
    icon: FileText,
    children: [
      { name: "All Assignments", href: "/assignments" },
      { name: "Create Assignment", href: "/assignments/create" },
    ],
  },
  {
    name: "Fee Management",
    icon: DollarSign,
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
  },
  {
    name: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

function NavItem({ item, pathname, collapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive =
    item.href === pathname ||
    item.children?.some((child) => child.href === pathname);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{item.name}</span>}
          </div>
          {!collapsed &&
            (isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>
        {isOpen && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname === child.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                )}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <School className="h-8 w-8 text-sidebar-primary" />
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              EduManage
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              School Management
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-sidebar-border z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-40"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
