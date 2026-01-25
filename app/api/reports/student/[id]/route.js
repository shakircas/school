import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";
import Student from "@/models/Student";

// export async function GET(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = await params;
//     const { searchParams } = new URL(req.url);
//     const year = parseInt(searchParams.get("year")) || 2025;

//     // Define the academic session (e.g., April to March)
//     const sessionStart = new Date(year, 3, 1); // April 1st
//     const sessionEnd = new Date(year + 1, 2, 31); // March 31st next year

//     console.log(id);
//     // Step 1: Check if any docs exist for this student at all
//     const rawCount = await Attendance.countDocuments({
//       "records.personId": new mongoose.Types.ObjectId(id),
//     });
//     console.log("Total docs for student in DB:", rawCount);

//     // Step 2: Check if dates are the problem
//     const dateMatchCount = await Attendance.countDocuments({
//       type: "Student",
//       date: { $gte: sessionStart, $lte: sessionEnd },
//       "records.personId": new mongoose.Types.ObjectId(id),
//     });
//     console.log("Docs matching date range:", dateMatchCount);

//     const report = await Attendance.aggregate([
//       {
//         $match: {
//           type: "Student",
//           date: { $gte: sessionStart, $lte: sessionEnd },
//           "records.personId": new mongoose.Types.ObjectId(id),
//         },
//       },
//       { $unwind: "$records" },
//       {
//         $match: {
//           "records.personId": new mongoose.Types.ObjectId(id),
//         },
//       },
//       {
//         $group: {
//           // Group by Month (1-12)
//           _id: { $month: "$date" },
//           presents: {
//             $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] },
//           },
//           absents: {
//             $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] },
//           },
//           leaves: {
//             $sum: { $cond: [{ $eq: ["$records.status", "Leave"] }, 1, 0] },
//           },
//           totalDays: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month order
//     ]);

//     return NextResponse.json(report);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year")) || 2025;

    const sessionStart = new Date(year, 3, 1); // April 1st
    const sessionEnd = new Date(year + 1, 2, 31); // March 31st next year

    // 1️⃣ Fetch Student Profile Details first
    const studentProfile = await Student.findById(id)
      .select("name rollNumber status classId sectionId")
      .populate("classId", "name") // Optional: populates class name if ref exists
      .lean();

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 2️⃣ Flexible Match (Handles both String and ObjectId formats)
    const studentIds = [id];
    if (mongoose.Types.ObjectId.isValid(id)) {
      studentIds.push(new mongoose.Types.ObjectId(id));
    }

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          type: "Student",
          date: { $gte: sessionStart, $lte: sessionEnd },
          "records.personId": { $in: studentIds }, // Matches both formats
        },
      },
      { $unwind: "$records" },
      {
        $match: {
          "records.personId": { $in: studentIds },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          presents: {
            $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] },
          },
          absents: {
            $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] },
          },
          leaves: {
            $sum: { $cond: [{ $eq: ["$records.status", "Leave"] }, 1, 0] },
          },
          totalDays: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3️⃣ Return combined data
    // 3️⃣ Fetch specific dates for Absence/Leave/Late (The Audit Trail)
    // Fetch EVERY attendance date for the calendar (including "Present")
    const history = await Attendance.find({
      type: "Student",
      date: { $gte: sessionStart, $lte: sessionEnd },
      "records.personId": { $in: studentIds },
    })
      .select("date records.status records.personId records.remarks")
      .sort({ date: -1 })
      .lean();

    // Filter records array to only include this specific student's entry
    const filteredHistory = history.map((doc) => {
      const record = doc.records.find((r) =>
        studentIds.map((id) => id.toString()).includes(r.personId.toString()),
      );
      return {
        date: doc.date,
        status: record?.status,
        remarks: record?.remarks || "No remarks",
      };
    });
    // Update return statement
    return NextResponse.json({
      student: studentProfile,
      report: attendanceStats,
      history: filteredHistory,
    });
  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
