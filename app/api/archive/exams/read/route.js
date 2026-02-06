import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req) {
  await connectDB();

  const year = req.nextUrl.searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  const collectionName = `exams_archive_${year.replace("-", "_")}`;

  try {
    const data = await mongoose.connection
      .collection(collectionName)
      .find({})
      .sort({ startDate: 1 })
      .toArray();

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Archived exams not found" },
      { status: 404 },
    );
  }
}
