import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req) {
  await connectDB();

  const year = req.nextUrl.searchParams.get("year");

  if (!year) {
    return NextResponse.json(
      { error: "academicYear is required" },
      { status: 400 },
    );
  }

  const collectionName = `attendances_${year.replace("-", "_")}`;

  try {
    const data = await mongoose.connection
      .collection(collectionName)
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Archived attendance not found" },
      { status: 404 },
    );
  }
}
