import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    await connectDB();
    const { collectionName } = await req.json();

    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 },
      );
    }

    // Safety: Ensure we are only dropping archive collections, never live ones
    if (
      !collectionName.includes("archive") &&
      !collectionName.startsWith("attendances_20")
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Only archive collections can be purged." },
        { status: 403 },
      );
    }

    const db = mongoose.connection.db;
    await db.dropCollection(collectionName);

    return NextResponse.json({
      message: `Collection ${collectionName} has been permanently deleted.`,
    });
  } catch (error) {
    console.error("Purge Error:", error);
    return NextResponse.json(
      {
        error: "Failed to purge collection. It may have already been removed.",
      },
      { status: 500 },
    );
  }
}
