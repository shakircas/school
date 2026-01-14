"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  School,
  Users,
  Award,
  ShieldCheck,
  Clock,
  Briefcase,
  Plus,
  Edit,
  ChevronRight,
  FileText,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((res) => res.json());
export default function TeacherProfile({ teacher }) {
  // 1. EXTRACT TEACHER SCHEDULE FROM CLASS COLLECTION
  // We loop through all classes and filter periods where teacher ID matches
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];
  const teacherSchedule = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].map((dayName) => {
    const daySchedule = { day: dayName, periods: [] };

    classes.forEach((cls) => {
      const dayData = cls.schedule?.find(
        (s) => s.day.toLowerCase() === dayName.toLowerCase()
      );
      if (dayData) {
        const matchingPeriods = dayData.periods
          .filter(
            (p) =>
              p.teacher?.toString() === teacher._id?.toString() ||
              p.teacher === teacher._id
          )
          .map((p) => ({
            time: p.time,
            subject: p.subjectName || p.subject,
            className: cls.name,
            classId: cls._id,
          }));
        daySchedule.periods.push(...matchingPeriods);
      }
    });

    // Sort periods by time
    daySchedule.periods.sort((a, b) => a.time.localeCompare(b.time));
    return daySchedule;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      {/* --- PREMIUM HEADER SECTION --- */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-10">
          <div className="relative group">
            <Avatar className="h-40 w-40 rounded-[2.5rem] border-4 border-white dark:border-zinc-900 shadow-2xl transition-all duration-500 group-hover:rotate-3">
              <AvatarImage src={teacher.photo?.url} className="object-cover" />
              <AvatarFallback className="text-5xl font-black bg-zinc-100 dark:bg-zinc-900 text-primary">
                {teacher.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 border-4 border-white dark:border-zinc-950 rounded-full font-bold uppercase tracking-widest text-[10px]">
              {teacher.status}
            </Badge>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-5">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                {teacher.name}
              </h1>
              <p className="text-primary font-bold uppercase tracking-[0.2em] text-[11px] mt-1 flex items-center justify-center lg:justify-start gap-2">
                <Award size={14} /> {teacher.designation}{" "}
                <span className="text-zinc-300">|</span> {teacher.personalNo}
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <HeaderChip icon={<Mail size={14} />} label={teacher.email} />
              <HeaderChip icon={<Phone size={14} />} label={teacher.phone} />
              <HeaderChip
                icon={<ShieldCheck size={14} />}
                label={`NIC: ${teacher.nic}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
              Apply Leave
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl h-12 border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-widest text-[10px]"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT TABS --- */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="schedule"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest"
          >
            Teacher Schedule
          </TabsTrigger>
          <TabsTrigger
            value="professional"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest"
          >
            Service & Academic
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest"
          >
            Documents
          </TabsTrigger>
        </TabsList>

        {/* 1. DYNAMIC SCHEDULE TAB */}
        <TabsContent
          value="schedule"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
            {teacherSchedule.map((dayData) => (
              <div key={dayData.day} className="space-y-4">
                <div className="bg-zinc-100 dark:bg-zinc-900/50 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {dayData.day}
                  </span>
                </div>

                <div className="space-y-3">
                  {dayData.periods.length > 0 ? (
                    dayData.periods.map((period, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase mb-1">
                          <Clock size={12} /> {period.time}
                        </div>
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 leading-tight">
                          {period.subject}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 italic">
                          {period.className}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center opacity-20 italic text-[10px] uppercase font-bold">
                      No Classes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 2. PROFESSIONAL & PERSONAL DETAILS */}
        <TabsContent
          value="professional"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InfoSection title="Service Record" icon={<Briefcase size={20} />}>
              <DetailRow label="Govt Designation" value={teacher.designation} />
              <DetailRow label="Personal No" value={teacher.personalNo} />
              <DetailRow
                label="Experience"
                value={`${teacher.experience} Years`}
              />
              <DetailRow
                label="Joining Date"
                value={new Date(teacher.joiningDate).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              />
            </InfoSection>

            <InfoSection
              title="Qualifications"
              icon={<GraduationCap size={20} />}
            >
              <DetailRow label="Academic" value={teacher.qualification} />
              <div className="py-3 flex flex-wrap gap-2">
                {teacher.professionalQualification?.map((q) => (
                  <Badge
                    key={q}
                    variant="outline"
                    className="rounded-lg font-bold text-[10px] uppercase"
                  >
                    {q}
                  </Badge>
                ))}
              </div>
              <DetailRow
                label="Specialization"
                value={teacher.specialization || "General"}
              />
            </InfoSection>
          </div>
        </TabsContent>

        {/* 3. DOCUMENTS TAB */}
        <TabsContent value="docs">
          <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacher.documents?.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">
                      {doc.name || "Credential Document"}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={18} />
                </a>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function HeaderChip({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}

function InfoSection({ title, icon, children }) {
  return (
    <Card className="rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-zinc-50 dark:border-zinc-900 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 italic">
          <span className="p-2 bg-primary/10 rounded-xl text-primary">
            {icon}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-1">{children}</CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-zinc-50 dark:border-zinc-900 last:border-none">
      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
        {label}
      </span>
      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
        {value || "—"}
      </span>
    </div>
  );
}
