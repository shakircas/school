import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Class from "@/models/Class"

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const data = await request.json()
    const cls = await Class.findByIdAndUpdate(params.id, data, { new: true })

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: cls })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    await Class.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: "Class deleted" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
