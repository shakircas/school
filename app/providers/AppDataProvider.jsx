"use client";

import { createContext, useContext, useEffect, useState } from "react";
import * as offlineDB from "@/lib/offline-db";

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  // MAIN DATA STATES
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [timetable, setTimetable] = useState([]);

  /* -------------------------------
      INTERNET STATUS DETECTION
  ------------------------------- */
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  /* -------------------------------
      LOAD DATA (ONLINE / OFFLINE)
  ------------------------------- */
  /* -------------------------------
    LOAD DATA (ONLINE / OFFLINE)
------------------------------- */
  const loadData = async () => {
    setLoading(true);

    // Helper: sanitize every object before saving to IndexedDB
    const sanitizeItem = (item, store) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        console.warn(`⚠ Dropped invalid item in "${store}"`, item);
        return null;
      }

      return {
        ...item,
        _id: item._id || generateId(), // ensure _id exists
        synced: typeof item.synced === "boolean" ? item.synced : true,
        updatedAt: item.updatedAt || new Date().toISOString(),
      };
    };

    try {
      if (isOffline) {
        console.log("📴 Loading OFFLINE IndexedDB...");

        const offlineStudents = await offlineDB.getAll("students");
        const offlineClasses = await offlineDB.getAll("classes");
        const offlineTeachers = await offlineDB.getAll("teachers");
        const offlineSubjects = await offlineDB.getAll("subjects");
        const offlineExams = await offlineDB.getAll("exams");
        const offlineTimetable = await offlineDB.getAll("timetable");

        setStudents(offlineStudents || []);
        setClasses(offlineClasses || []);
        setTeachers(offlineTeachers || []);
        setSubjects(offlineSubjects || []);
        setExams(offlineExams || []);
        setTimetable(offlineTimetable || []);

        console.log("📚 Offline students:", offlineStudents);
        console.log("🏫 Offline classes:", offlineClasses);
      } else {
        console.log("🌐 Loading ONLINE API...");

        const res = await fetch("/api/mis/bootstrap");
        const data = await res.json();

        // Sanitize and assign to state
        const stores = [
          "students",
          "classes",
          "teachers",
          "subjects",
          "exams",
          "timetable",
        ];
        for (const store of stores) {
          if (!Array.isArray(data[store])) {
            console.warn(`⚠ API returned invalid ${store}, skipping`);
            continue;
          }

          const cleaned = data[store]
            .map((item) => sanitizeItem(item, store))
            .filter(Boolean);

          switch (store) {
            case "students":
              setStudents(cleaned);
              break;
            case "classes":
              setClasses(cleaned);
              break;
            case "teachers":
              setTeachers(cleaned);
              break;
            case "subjects":
              setSubjects(cleaned);
              break;
            case "exams":
              setExams(cleaned);
              break;
            case "timetable":
              setTimetable(cleaned);
              break;
          }

          // Save sanitized data to IndexedDB
          await offlineDB.bulkSave(store, cleaned);
        }

        console.log("📚 Online students:", data.students);
        console.log("🏫 Online classes:", data.classes);
      }
    } catch (err) {
      console.error("❌ Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
      AUTO LOAD DATA ON MOUNT
  ------------------------------- */
  useEffect(() => {
    loadData();
  }, [isOffline]);

  /* -------------------------------
      PROVIDER VALUE
  ------------------------------- */
  const value = {
    isOffline,
    loading,
    students,
    classes,
    teachers,
    subjects,
    exams,
    timetable,
    refresh: loadData,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
