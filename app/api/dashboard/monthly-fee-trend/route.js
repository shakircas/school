import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear");

    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 }
      );
    }

    const fees = await Fee.find({ academicYear: "2024-2025" }).lean();

    const trendMap = {};

    MONTHS.forEach((m) => {
      trendMap[m] = {
        month: m,
        collected: 0,
        pending: 0,
      };
    });

    fees.forEach((fee) => {
      const month = fee.month;
      if (!trendMap[month]) return;

      trendMap[month].collected += fee.paidAmount || 0;
      trendMap[month].pending += fee.dueAmount || 0;
    });

    return NextResponse.json(Object.values(trendMap));
  } catch (error) {
    console.error("Monthly fee trend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly fee trend" },
      { status: 500 }
    );
  }
}
