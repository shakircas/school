import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { userId } = await request.json();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use $addToSet with $ne (not equal) to ensure the user is only added once
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        "readBy.user": { $ne: userId },
      },
      {
        $push: {
          readBy: { user: userId, readAt: new Date() },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: notification ? "Marked as read" : "Already read",
    });
  } catch (error) {
    console.error("Read Receipt Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
