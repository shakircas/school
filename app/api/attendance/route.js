// import { NextResponse } from "next/server"
// import connectDB from "@/lib/db"
// import Attendance from "@/models/Attendance"

// export async function GET(request) {
//   try {
//     await connectDB()

//     const { searchParams } = new URL(request.url)
//     const date = searchParams.get("date")
//     const type = searchParams.get("type")
//     const classFilter = searchParams.get("class")
//     const section = searchParams.get("section")

//     const query = {}

//     if (date) {
//       const startDate = new Date(date)
//       startDate.setHours(0, 0, 0, 0)
//       const endDate = new Date(date)
//       endDate.setHours(23, 59, 59, 999)
//       query.date = { $gte: startDate, $lte: endDate }
//     }

//     if (type) {
//       query.type = type
//     }

//     if (classFilter) {
//       query.class = classFilter
//     }

//     if (section) {
//       query.section = section
//     }

//     const attendance = await Attendance.find(query).sort({ date: -1 }).lean()

//     return NextResponse.json(attendance)
//   } catch (error) {
//     console.error("Error fetching attendance:", error)
//     return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
//   }
// }

// export async function POST(request) {
//   try {
//     await connectDB()

//     const data = await request.json()

//     // Check if attendance already exists for this date/class/section
//     const existingAttendance = await Attendance.findOne({
//       date: new Date(data.date),
//       type: data.type,
//       class: data.class,
//       section: data.section,
//     })

//     if (existingAttendance) {
//       // Update existing attendance
//       existingAttendance.records = data.records
//       existingAttendance.markedAt = new Date()
//       await existingAttendance.save()
//       return NextResponse.json(existingAttendance)
//     }

//     const attendance = new Attendance(data)
//     await attendance.save()

//     return NextResponse.json(attendance, { status: 201 })
//   } catch (error) {
//     console.error("Error creating attendance:", error)
//     return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
//   }
// }

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
   GET — Attendance (filtered, optimized)
------------------------------------------------- */
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const type = searchParams.get("type"); // Student | Teacher
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("section");

    const query = {};

    /* ---- Date range (single day) ---- */
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (type) query.type = type;

    if (classId) {
      if (!isValidObjectId(classId)) return error("Invalid classId");
      query.classId = classId;
    }

    if (sectionId) query.sectionId = sectionId;

    const attendance = await Attendance.find(query)
      .populate("markedBy", "name")
      .populate("classId", "name")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ attendance });
  } catch (err) {
    console.error("GET attendance error", err);
    return error("Failed to fetch attendance", 500);
  }
}

/* -------------------------------------------------
   POST — Mark attendance (SAFE + SMART)
------------------------------------------------- */
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      date,
      type,
      classId,
      sectionId,
      records = [],
      markedBy,
    } = body;

    if (!date || !type) return error("Date and type are required");

    if (type === "Student") {
      if (!classId || !sectionId) {
        return error("classId and section are required for student attendance");
      }
      if (!isValidObjectId(classId)) return error("Invalid classId");
    }

    if (markedBy && !isValidObjectId(markedBy)) {
      return error("Invalid markedBy teacher ID");
    }

    /* ---- Validate class existence ---- */
    if (classId) {
      const cls = await Class.findById(classId);
      if (!cls) return error("Class not found");
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

    /* ---- Validate student belongs to class + section ---- */
    // if (type === "Student") {
    //   const studentIds = records.map(r => r.personId);

    //   const count = await Student.countDocuments({
    //     _id: { $in: studentIds },
    //     classId,
    //     section: sectionId,
    //   });

    //   if (count !== studentIds.length) {
    //     return error("One or more students do not belong to this class/section");
    //   }
    // }

    /* ---- Prevent duplicate attendance per day ---- */
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      date: { $gte: start, $lte: end },
      type,
      classId: classId || null,
      sectionId: sectionId || null,
    });

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
      classId: classId || null,
      sectionId: sectionId || null,
      records,
      markedBy: markedBy || null,
    });

    return NextResponse.json({ data: attendance }, { status: 201 });
  } catch (err) {
    console.error("POST attendance error", err);
    return error(err.message || "Failed to mark attendance");
  }
}
