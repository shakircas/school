import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectDB from "@/lib/db";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Accept 'Student' or 'Teacher' (Capitalized to match your Model)
    const type = searchParams.get("type") || "Teacher";

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          type: type, // Filters dynamically by type
        },
      },
      { $unwind: "$records" },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          presentCount: {
            $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] },
          },
          totalCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Format results
    const formattedData = stats.map((item) => ({
      month: monthNames[item._id.month - 1],
      percentage:
        item.totalCount > 0
          ? Math.round((item.presentCount / item.totalCount) * 100)
          : 0,
    }));

    // If no data exists yet, return empty array rather than error
    return NextResponse.json(formattedData || []);
  } catch (error) {
    console.error("Trend API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
