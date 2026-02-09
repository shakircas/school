import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import Result from "@/models/Result";

export async function POST(req) {
  try {
    await connectDB();
    const { year, recordId } = await req.json();

    if (!year)
      return NextResponse.json({ error: "Year is required" }, { status: 400 });

    const archiveCollectionName = `results_archive_${year.replace("-", "_")}`;
    const db = mongoose.connection.db;
    const archiveCol = db.collection(archiveCollectionName);

    // If recordId is provided, restore one. Otherwise, restore all for that year.
    const query = recordId
      ? { _id: new mongoose.Types.ObjectId(recordId) }
      : {};
    const archivedData = await archiveCol.find(query).toArray();

    if (archivedData.length === 0) {
      return NextResponse.json(
        { error: "No records found to restore" },
        { status: 404 },
      );
    }

    // 1. Move to Live Result Collection
    // ordered: false ensures that if one record fails (e.g. duplicate), the rest continue
    try {
      await Result.insertMany(archivedData, { ordered: false });
    } catch (e) {
      console.warn("Some records may already exist in the live collection.");
    }

    // 2. Remove from Archive Collection
    await archiveCol.deleteMany(query);

    return NextResponse.json({
      message: `${archivedData.length} result(s) restored to live database successfully.`,
    });
  } catch (error) {
    console.error("Restore Error:", error);
    return NextResponse.json(
      { error: "Failed to restore results" },
      { status: 500 },
    );
  }
}
