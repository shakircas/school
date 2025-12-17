import connectDB from "@/lib/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const stats = await Student.aggregate([
    {
      $group: {
        _id: "$class",
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
        },
        inactive: {
          $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json(stats);
}
