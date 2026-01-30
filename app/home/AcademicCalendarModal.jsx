"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Download,
  Printer,
  Info,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AcademicCalendarModal({ trigger }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* Increased max-width to 7xl to prevent squeezing */}
      <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl h-[80vh] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Academic Calendar
              </DialogTitle>
              <p className="text-slate-500 font-medium text-sm">
                Session 2026 - 2027 • SmartSchool
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print
            </Button>
            <Button className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Download size={16} /> PDF
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Calendar View Area */}
          <ScrollArea className="flex-1 bg-white p-4 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
              {months.map((month, idx) => (
                <MonthCard key={month} name={month} index={idx} />
              ))}
            </div>
          </ScrollArea>

          {/* Key Events Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l bg-slate-50/30 p-6 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              Upcoming Events
            </h3>
            <div className="space-y-6">
              <EventItem
                date="Mar 23"
                title="Pakistan Day"
                type="Holiday"
                color="bg-rose-500"
              />
              <EventItem
                date="Apr 10"
                title="Eid-ul-Fitr"
                type="Holiday"
                color="bg-emerald-500"
              />
              <EventItem
                date="May 15"
                title="Annual Exams"
                type="Academic"
                color="bg-amber-500"
              />
              <EventItem
                date="Jun 01"
                title="Summer Break"
                type="Break"
                color="bg-blue-500"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MonthCard({ name, index }) {
  const days = new Date(2026, index + 1, 0).getDate();
  const startDay = new Date(2026, index, 1).getDay();

  return (
    <div className="border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
      <h4 className="text-lg font-bold text-slate-800 mb-4 px-1 flex justify-between">
        {name}
        <span className="text-slate-300 font-normal">2026</span>
      </h4>

      {/* Grid for days of the week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid for actual dates */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={i} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const isWeekend =
            (d + startDay - 1) % 7 === 0 || (d + startDay - 1) % 7 === 6;
          return (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-xl cursor-default
                ${isWeekend ? "text-rose-500 bg-rose-50/30" : "text-slate-600 hover:bg-slate-50"}
              `}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventItem({ date, title, type, color }) {
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div className="text-center min-w-[50px]">
        <p className="text-xs font-bold text-slate-400 uppercase">
          {date.split(" ")[0]}
        </p>
        <p className="text-lg font-black text-slate-800 leading-none">
          {date.split(" ")[1]}
        </p>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
            {type}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
          {title}
        </p>
      </div>
      <ChevronRight
        size={14}
        className="text-slate-300 self-center group-hover:translate-x-1 transition-transform"
      />
    </div>
  );
}
