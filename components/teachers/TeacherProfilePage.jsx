"use client";

import React, { useState } from "react";
import {
  Calendar,
  BookOpen,
  Clock,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Download,
  Edit,
  Award,
  FileText,
  Plus,
  ShieldCheck,
  CreditCard,
  Building2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ==========================================
// 1. LEAVE APPLICATION MODAL COMPONENT
// ==========================================
export function LeaveRequestModal({ isOpen, onClose, teacherName }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] bg-white dark:bg-[#0c0c0e] border-zinc-200 dark:border-zinc-800 shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-primary">
            Apply for Leave
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Requesting leave for {teacherName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                Start Date
              </label>
              <Input
                type="date"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                End Date
              </label>
              <Input
                type="date"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
              Leave Type
            </label>
            <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:ring-2 ring-primary/20 appearance-none">
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Duty Leave (Official)</option>
              <option>Maternity/Paternity</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
              Reason for Absence
            </label>
            <Textarea
              placeholder="Provide context for the administration..."
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[100px] resize-none focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl flex-1 font-bold text-[10px] uppercase tracking-widest h-12"
          >
            Cancel
          </Button>
          <Button className="rounded-xl flex-1 bg-primary font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 h-12">
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 2. MAIN TEACHER PROFILE PAGE
// ==========================================
export default function TeacherProfilePage({ teacher }) {
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  // Fallback data structure based exactly on your provided Mongoose schemas
  const t = teacher || {
    name: "M. Iftikhar Khan",
    designation: "SST (Computer Science)",
    personalNo: "12345678",
    nic: "17301-1234567-1",
    qualification: "MSc",
    professionalQualification: ["B.Ed", "CT"],
    status: "Active",
    email: "iftikhar.cs@school.edu.pk",
    phone: "+92 301 5556677",
    experience: 12,
    joiningDate: "2018-03-15",
    assignedClasses: [
      { class: "Grade 10", section: "A", subject: "Computer Science" },
      { class: "Grade 9", section: "B", subject: "Mathematics" },
    ],
    bankDetails: {
      bankName: "National Bank of Pakistan",
      accountNumber: "PK00NBP123456789",
    },
    address: {
      city: "Peshawar",
      street: "Hayatabad Phase 3",
      country: "Pakistan",
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER CARD */}
      <div className="relative bg-white dark:bg-[#0c0c0e] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-10 items-start lg:items-center">
          <div className="relative">
            <Avatar className="h-40 w-40 rounded-[2.5rem] border-4 border-white dark:border-zinc-900 shadow-2xl">
              <AvatarImage src={t.photo?.url} />
              <AvatarFallback className="text-5xl font-black bg-primary/10 text-primary">
                {t.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-white dark:border-zinc-900 flex items-center justify-center text-white shadow-lg">
              <UserCheck size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                  {t.name}
                </h1>
                <Badge
                  className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest border-none ${
                    t.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {t.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                  <Award size={16} className="text-primary" /> {t.designation}
                </p>
                <p className="text-zinc-400 font-mono text-[11px] font-bold">
                  ID: {t.personalNo}
                </p>
                <p className="text-zinc-400 font-mono text-[11px] font-bold">
                  NIC: {t.nic}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ContactBadge icon={<Mail size={14} />} text={t.email} />
              <ContactBadge icon={<Phone size={14} />} text={t.phone} />
              <ContactBadge
                icon={<MapPin size={14} />}
                text={`${t.address.city}, ${t.address.country}`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <Button
              onClick={() => setLeaveModalOpen(true)}
              className="rounded-2xl gap-2 h-12 bg-primary px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform font-bold text-xs uppercase tracking-widest"
            >
              <Calendar size={16} /> Request Leave
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl gap-2 h-12 border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-widest"
            >
              <Edit size={16} /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT TABS */}
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 w-full sm:w-auto">
          <TabsTrigger
            value="assignments"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-[0.2em]"
          >
            Assigned Classes
          </TabsTrigger>
          <TabsTrigger
            value="governance"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-[0.2em]"
          >
            Service Details
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-[0.2em]"
          >
            Payroll Info
          </TabsTrigger>
        </TabsList>

        {/* 1. ASSIGNED CLASSES (Using assignedClasses Schema) */}
        <TabsContent
          value="assignments"
          className="animate-in fade-in slide-in-from-left-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.assignedClasses.map((item, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-[#0c0c0e] p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-primary transition-all cursor-pointer shadow-sm"
              >
                <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic mb-1">
                  {item.subject}
                </h4>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">
                  {item.class} — Section {item.section}
                </p>
                <div className="mt-6 flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                    Enter Attendance
                  </span>
                  <Plus size={16} className="text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 2. SERVICE & ACADEMIC DETAILS */}
        <TabsContent
          value="governance"
          className="animate-in fade-in slide-in-from-left-4 duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InfoSection
              title="Academic Credentials"
              icon={<GraduationCap className="text-primary" />}
            >
              <DataRow label="Qualification" value={t.qualification} />
              <div className="py-3">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3">
                  Professional Certification
                </p>
                <div className="flex gap-2">
                  {t.professionalQualification.map((q) => (
                    <Badge
                      key={q}
                      variant="secondary"
                      className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-none font-bold uppercase text-[10px]"
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </div>
            </InfoSection>

            <InfoSection
              title="Service History"
              icon={<ShieldCheck className="text-primary" />}
            >
              <DataRow label="Designation" value={t.designation} />
              <DataRow
                label="Joining Date"
                value={new Date(t.joiningDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
              <DataRow label="Experience" value={`${t.experience} Years`} />
            </InfoSection>
          </div>
        </TabsContent>

        {/* 3. FINANCE & BANKING (Using salary and bankDetails Schema) */}
        <TabsContent
          value="finance"
          className="animate-in fade-in slide-in-from-left-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-[#0c0c0e] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-primary" size={24} />
                <h3 className="font-black uppercase tracking-tighter text-xl italic">
                  Banking Details
                </h3>
              </div>
              <DataRow label="Bank Name" value={t.bankDetails.bankName} />
              <DataRow
                label="Account Number"
                value={t.bankDetails.accountNumber}
              />
            </div>
            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="text-primary" size={24} />
                <h3 className="font-black uppercase tracking-tighter text-xl italic">
                  Workplace
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Salary is disbursed automatically to the linked account. <br />
                For changes, contact the District Education Office (DEO).
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        teacherName={t.name}
      />
    </div>
  );
}

// ==========================================
// 3. HELPER UI COMPONENTS
// ==========================================
function ContactBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
  );
}

function InfoSection({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        {icon}
        <h3 className="font-black uppercase tracking-tighter text-xl italic">
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-none">
      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
        {label}
      </span>
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
        {value}
      </span>
    </div>
  );
}
