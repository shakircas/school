import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const notification = await Notification.findByIdAndDelete(params.id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Notification deleted" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
