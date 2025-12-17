// "use client";

// import { createContext, useContext, useMemo } from "react";
// import useSWR from "swr";

// const SchoolDataContext = createContext(null);

// const fetcher = (url) => fetch(url).then((r) => r.json());

// export function SchoolDataProvider({ children }) {
//   // Fetch everything ONCE globally
//   const { data: classes, isLoading: classesLoading } = useSWR(
//     "/api/academics/classes",
//     fetcher
//   );

//   const { data: teachers, isLoading: teachersLoading } = useSWR(
//     "/api/teachers",
//     fetcher
//   );

//   const { data: students, isLoading: studentsLoading } = useSWR(
//     "/api/students",
//     fetcher
//   );

//   const { data: subjects, isLoading: subjectsLoading } = useSWR(
//     "/api/subjects",
//     fetcher
//   );

//   // Memoize to prevent unnecessary re-renders
//   const value = useMemo(
//     () => ({
//       classes,
//       teachers,
//       students,
//       subjects,
//       loading:
//         classesLoading || teachersLoading || studentsLoading || subjectsLoading,
//     }),
//     [
//       classes,
//       teachers,
//       students,
//       subjects,
//       classesLoading,
//       teachersLoading,
//       studentsLoading,
//       subjectsLoading,
//     ]
//   );

//   return (
//     <SchoolDataContext.Provider value={value}>
//       {children}
//     </SchoolDataContext.Provider>
//   );
// }

// export function useSchoolData() {
//   const context = useContext(SchoolDataContext);
//   if (!context) {
//     throw new Error("useSchoolData must be used within SchoolDataProvider");
//   }
//   return context;
// }

"use client";

import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";
import { saveOffline, getOffline } from "@/lib/offline-cache";

const SchoolDataContext = createContext(null);
const fetcher = (url) => fetch(url).then((r) => r.json());

export function SchoolDataProvider({ children }) {
  // Classes
  const { data: classes } = useSWR("/api/academics/classes", fetcher, {
    fallbackData: getOffline("classes"),
    onSuccess: (data) => saveOffline("classes", data),
  });

  // Students
  const { data: students } = useSWR("/api/students", fetcher, {
    fallbackData: getOffline("students"),
    onSuccess: (data) => saveOffline("students", data),
  });

  // Teachers
  const { data: teachers } = useSWR("/api/teachers", fetcher, {
    fallbackData: getOffline("teachers"),
    onSuccess: (data) => saveOffline("teachers", data),
  });

  // Subjects
  const { data: subjects } = useSWR("/api/academics/subjects", fetcher, {
    fallbackData: getOffline("subjects"),
    onSuccess: (data) => saveOffline("subjects", data),
  });

  // Exams
  const { data: exams } = useSWR("/api/exams", fetcher, {
    fallbackData: getOffline("exams"),
    onSuccess: (data) => saveOffline("exams", data),
  });

  // Timetable / Schedule
  const { data: timetable } = useSWR("/api/academics/timetable", fetcher, {
    fallbackData: getOffline("timetable"),
    onSuccess: (data) => saveOffline("timetable", data),
  });

  const loading = !classes || !students || !teachers || !subjects;

  const value = useMemo(
    () => ({
      classes,
      students,
      teachers,
      subjects,
      exams,
      timetable,
      loading,
    }),
    [classes, students, teachers, subjects, exams, timetable, loading]
  );

  return (
    <SchoolDataContext.Provider value={value}>
      {children}
    </SchoolDataContext.Provider>
  );
}

export function useSchoolData() {
  const ctx = useContext(SchoolDataContext);
  if (!ctx) throw new Error("useSchoolData must be inside provider");
  return ctx;
}
