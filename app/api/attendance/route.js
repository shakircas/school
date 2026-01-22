// app/api/attendance/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import mongoose from "mongoose";

/* -------------------------------------------------
   HELPERS
------------------------------------------------- */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/* -------------------------------------------------
   GET — Attendance (Bypass Class for Teachers)
------------------------------------------------- */
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const type = searchParams.get("type"); // Student | Teacher
    const classId = searchParams.get("classId" || "all");
    const sectionId = searchParams.get("section" || "all");
    const month = searchParams.get("month"); // Optional for registry
    const year = searchParams.get("year"); // Optional for registry

    const query = {};

    // 1. Handle Type
    if (type) query.type = type;
    const isTeacher = type === "Teacher"; // 2. Handle Date Filtering (Single Day or Full Month)

    if (date) {
      // Single day view (used in Mark Attendance page)
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (month && year) {
      // Month view (used in Registry/Table page)
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    // 3. Bypass Logic: Only apply class/section filters if NOT a teacher
    // or if specifically requested.
    if (!isTeacher) {
      if (classId) {
        if (!isValidObjectId(classId)) return error("Invalid classId");
        query.classId = classId;
      }
      if (sectionId) query.sectionId = sectionId;
    } else {
      // For Teachers, we strictly look for records where classId is null
      // This ensures we don't accidentally pull student records if schema changes
      query.classId = { $exists: false };
    }

    const attendance = await Attendance.find(query)
      .populate("markedBy", "name")
      // Only populate class if it exists (avoids errors on Teacher records)
      .populate({ path: "classId", select: "name", strictPopulate: false })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ attendance });
  } catch (err) {
    console.error("GET attendance error", err);
    return error("Failed to fetch attendance", 500);
  }
}


// Add this helper to your route.js
const getFindQuery = (type, date, classId, sectionId) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const base = {
    date: { $gte: start, $lte: end },
    type: type
  };

  if (type === "Teacher") {
    base.sectionId = "Staff";
    base.classId = { $exists: false }; // Or null
  } else {
    base.classId = classId;
    base.sectionId = sectionId;
  }
  return base;
};
/* -------------------------------------------------
   POST — Mark attendance (BYPASS CLASS FOR TEACHERS)
------------------------------------------------- */
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      date,
      type, // "Student" or "Teacher"
      classId,
      sectionId,
      records = [],
      markedBy,
    } = body;

    if (!date || !type) return error("Date and type are required");

    console.log(type);

    // --- BYPASS LOGIC START ---
    const isTeacher = type === "Teacher";

    if (type === "Student") {
      if (!classId || !sectionId) {
        return error("classId and section are required for student attendance");
      }
      if (!isValidObjectId(classId)) return error("Invalid classId");
    }

    // Only validate Class existence if it's NOT a teacher
    if (!isTeacher && classId) {
      const cls = await Class.findById(classId);
      if (!cls) return error("Class not found");
    }
    // --- BYPASS LOGIC END ---

    if (markedBy && !isValidObjectId(markedBy)) {
      return error("Invalid markedBy teacher ID");
    }

    /* ---- Validate records ---- */
    if (!Array.isArray(records) || !records.length) {
      return error("Attendance records are required");
    }

    for (const r of records) {
      if (!isValidObjectId(r.personId)) {
        return error("Invalid personId in records");
      }
      if (!r.status) return error("Attendance status required");
    }

    /* ---- Prevent duplicate attendance per day ---- */
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Filter criteria: For teachers, classId and sectionId are null
    const findQuery = {
      date: { $gte: start, $lte: end },
      type,
      classId: isTeacher ? null : classId,
      sectionId: isTeacher ? "Staff" : sectionId,
    };

    const existing = await Attendance.findOne(findQuery);

    if (existing) {
      existing.records = records;
      existing.markedAt = new Date();
      if (markedBy) existing.markedBy = markedBy;
      await existing.save();
      return NextResponse.json({ data: existing });
    }

    const attendance = await Attendance.create({
      date,
      type,
      // If teacher, bypass by providing null or a specific flag
      classId: isTeacher ? undefined : classId,
      sectionId: isTeacher ? "Staff" : sectionId,
      records,
      markedBy: markedBy || null,
    });

    return NextResponse.json({ data: attendance }, { status: 201 });
  } catch (err) {
    console.error("POST attendance error", err);
    return error(err.message || "Failed to mark attendance");
  }
}

/* -------------------------------------------------
   DELETE — Clear Attendance for a specific day/class
------------------------------------------------- */
export async function DELETE(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");

    if (!date || !type) {
      return error("Date and Type are required to delete records", 400);
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const findQuery = {
      date: { $gte: start, $lte: end },
      type: type,
      classId: type === "Teacher" ? { $exists: false } : classId,
      sectionId: type === "Teacher" ? "Staff" : sectionId,
    };

    const result = await Attendance.findOneAndDelete(findQuery);

    if (!result) {
      return error("No attendance record found to delete", 404);
    }

    return NextResponse.json({ message: "Attendance record deleted successfully" });
  } catch (err) {
    console.error("DELETE attendance error", err);
    return error("Failed to delete attendance", 500);
  }
}