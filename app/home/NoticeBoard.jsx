"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowRight, Bell } from "lucide-react";
import { format } from "date-fns"; // Recommended for clean date formatting
import Link from "next/link";
import AcademicCalendarModal from "./AcademicCalendarModal";
import SyllabusModal from "./SyllabusModal";
import ScholarshipModal from "./ScholarshipModal";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NoticeBoard() {
  // Fetching from your API route with a limit of 5 for the homepage
  const {
    data: notifications,
    error,
    isLoading,
  } = useSWR("/api/notifications?limit=5", fetcher);

  return (
    <section id="notices" className="py-24 bg-slate-50 dark:bg-slate-900/20">
      <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-12">
        {/* LEFT: DYNAMIC CAMPUS NOTICES */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="text-emerald-600 animate-bounce" size={28} />
              Campus Notices
            </h2>
            <Link
              href="/notices"
              className="text-sm font-bold text-emerald-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              // Loading State
              [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))
            ) : error ? (
              <div className="p-8 text-center bg-red-50 text-red-500 rounded-2xl border border-red-100">
                Failed to load latest notices.
              </div>
            ) : notifications?.length > 0 ? (
              notifications.map((notice) => (
                <NoticeItem
                  key={notice._id}
                  // Formatting date from MongoDB createdAt
                  date={format(new Date(notice.createdAt), "MMM dd")}
                  title={notice.title}
                  tag={notice.category || "General"} // Assuming category exists in your schema
                  description={notice.message} // Optional: add message preview
                />
              ))
            ) : (
              <p className="text-slate-500 italic">
                No active notices at this time.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: STATIC RESOURCES */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Download className="text-emerald-500" /> Resources
          </h3>
          <div className="space-y-3">
            <div className="space-y-3">
              <AcademicCalendarModal
                trigger={
                  <div className="flex items-center justify-between p-4 border rounded-xl hover:border-emerald-500 group cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-sm font-semibold">
                      Academic Calendar 2026
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                }
              />
              <SyllabusModal
                trigger={
                  <div className="flex items-center justify-between p-4 border rounded-xl hover:border-emerald-500 group cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-sm font-semibold">
                      Syllabus Grade 6-10
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                }
              />

              <ScholarshipModal
                trigger={
                  <div className="flex items-center justify-between p-4 border rounded-xl hover:border-emerald-500 group cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-sm font-semibold">
                      Scholarship Form
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Updated NoticeItem for dynamic data */
function NoticeItem({ date, title, tag, description }) {
  return (
    <div className="flex gap-6 p-6 rounded-2xl bg-white dark:bg-slate-800/40 hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-emerald-100 group">
      <div className="text-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl h-fit border border-emerald-100/50">
        <p className="text-xl font-black text-emerald-600 leading-none">
          {date.split(" ")[1]}
        </p>
        <p className="text-[10px] font-bold uppercase text-emerald-700/70">
          {date.split(" ")[0]}
        </p>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
            {tag}
          </span>
        </div>
        <h4 className="text-lg font-bold group-hover:text-emerald-600 transition-colors">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-slate-500 line-clamp-1 mt-1">
            {description}
          </p>
        )}
      </div>
      <ArrowRight className="text-slate-300 self-center group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
    </div>
  );
}
