import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    // 1. List all collections in the database
    const collections = await db.listCollections().toArray();

    // 2. Filter for our archive collections
    const archiveCollections = collections.filter((col) =>
      col.name.startsWith("students_archive_"),
    );

    // 3. Get counts for each
    const summary = await Promise.all(
      archiveCollections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments();
        // Extract year from name: students_archive_2024_2025 -> 2024-2025
        const yearLabel = col.name
          .replace("students_archive_", "")
          .replace("_", "-");

        return {
          collectionName: col.name,
          year: yearLabel,
          count: count,
        };
      }),
    );

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch archive summary" },
      { status: 500 },
    );
  }
}
