import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const stats = await Promise.all(
      collections
        .filter(
          (col) =>
            col.name.includes("archive") ||
            col.name.startsWith("attendances_20"),
        )
        .map(async (col) => {
          const collectionStats = await db.command({ collStats: col.name });
          return {
            name: col.name,
            type: col.name.startsWith("results") ? "Results" : "Attendance",
            count: collectionStats.count,
            size: (collectionStats.size / 1024 / 1024).toFixed(2), // MB
            year:
              col.name.match(/\d{4}_\d{4}/)?.[0].replace("_", "-") || "Unknown",
          };
        }),
    );

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
