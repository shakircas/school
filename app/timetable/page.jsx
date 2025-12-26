"use client";

import { useEffect, useState } from "react";
import TimetableBoard from "@/components/timetable/TimetableBoard";
import TimetableToolbar from "@/components/timetable/TimetableToolbar";
import { detectClashes } from "@/lib/timetable/detectTeacherClashes";
import ClashWarnings from "@/components/timetable/ClashWarnings";
import TeacherLoadAnalytics from "@/components/timetable/TeacherLoadAnalytics";
import { calculateTeacherLoad } from "@/lib/timetable/teacherLoad";
import MobileTimetable from "@/components/timetable/MobileTimetable";
import { MainLayout } from "@/components/layout/main-layout";

export default function TimetablePage() {
  const [schedule, setSchedule] = useState([]);
  const [clashes, setClashes] = useState([]);

  const teacherLoad = calculateTeacherLoad(schedule);
  // Load offline draft (KP-safe)
  useEffect(() => {
    const draft = localStorage.getItem("timetable-draft");
    if (draft) setSchedule(JSON.parse(draft));
  }, []);

  // Save + detect clashes
  useEffect(() => {
    localStorage.setItem("timetable-draft", JSON.stringify(schedule));
    setClashes(detectClashes(schedule));
  }, [schedule]);

  return (
    <MainLayout>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="p-6 space-y-4">
          <TimetableToolbar schedule={schedule} setSchedule={setSchedule} />

          <TimetableBoard
            schedule={schedule}
            setSchedule={setSchedule}
            clashes={clashes}
          />

          <ClashWarnings clashes={clashes} />
          <TeacherLoadAnalytics data={teacherLoad} />
        </div>
      </div>
      {/* Mobile */}
      <MobileTimetable schedule={schedule} />
    </MainLayout>
  );
}
