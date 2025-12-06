import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "Active"
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    const notifications = await Notification.find({ status }).sort({ createdAt: -1 }).limit(limit).lean()

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    const notification = new Notification(data)
    await notification.save()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
