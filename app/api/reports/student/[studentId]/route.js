import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year")) || 2025;

    // Define the academic session (e.g., April to March)
    const sessionStart = new Date(year, 3, 1); // April 1st
    const sessionEnd = new Date(year + 1, 2, 31); // March 31st next year

    console.log(id);
    // Step 1: Check if any docs exist for this student at all
    const rawCount = await Attendance.countDocuments({
      "records.personId": new mongoose.Types.ObjectId(id),
    });
    console.log("Total docs for student in DB:", rawCount);

    // Step 2: Check if dates are the problem
    const dateMatchCount = await Attendance.countDocuments({
      type: "Student",
      date: { $gte: sessionStart, $lte: sessionEnd },
      "records.personId": new mongoose.Types.ObjectId(id),
    });
    console.log("Docs matching date range:", dateMatchCount);

    const report = await Attendance.aggregate([
      {
        $match: {
          type: "Student",
          date: { $gte: sessionStart, $lte: sessionEnd },
          "records.personId": new mongoose.Types.ObjectId(id),
        },
      },
      { $unwind: "$records" },
      {
        $match: {
          "records.personId": new mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          // Group by Month (1-12)
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
      { $sort: { _id: 1 } }, // Sort by month order
    ]);

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
