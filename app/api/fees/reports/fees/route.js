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
    const month = searchParams.get("month");

    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 }
      );
    }

    const match = { academicYear };
    if (month && month !== "all") match.month = month;

    /* =============================
       1️⃣ MONTHLY COLLECTION
    ============================== */
    const rawMonthly = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$month",
          collected: { $sum: "$paidAmount" },
          pending: { $sum: "$dueAmount" },
        },
      },
    ]);

    const monthly = MONTHS.map((m) => {
      const found = rawMonthly.find((r) => r._id === m);
      return {
        month: m,
        collected: found?.collected || 0,
        pending: found?.pending || 0,
      };
    });

    /* =============================
       2️⃣ CLASS-WISE COLLECTION
    ============================== */
    const classWise = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$classId",
          collected: { $sum: "$paidAmount" },
          pending: { $sum: "$dueAmount" },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: "$class" },
      {
        $project: {
          class: "$class.name",
          collected: 1,
          pending: 1,
          _id: 0,
        },
      },
      { $sort: { class: 1 } },
    ]);

    /* =============================
       3️⃣ PAYMENT METHODS
    ============================== */
    const paymentMethods = await Fee.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $group: {
          _id: "$payments.paymentMethod",
          value: { $sum: "$payments.amount" },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);


    /* =============================
       4️⃣ TOTALS
    ============================== */
    const totalsAgg = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$paidAmount" },
          totalPending: { $sum: "$dueAmount" },
        },
      },
    ]);

    const totals = totalsAgg[0] || {
      totalCollected: 0,
      totalPending: 0,
    };

    return NextResponse.json({
      monthly,
      classWise,
      paymentMethods,
      totals,
    });
  } catch (error) {
    console.error("Fee report error:", error);
    return NextResponse.json(
      { error: "Failed to generate fee reports" },
      { status: 500 }
    );
  }
}
