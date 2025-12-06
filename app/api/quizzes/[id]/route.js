import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Quiz from "@/models/Quiz"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const quiz = await Quiz.findById(params.id)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const data = await request.json()

    const quiz = await Quiz.findByIdAndUpdate(params.id, data, { new: true })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const quiz = await Quiz.findByIdAndDelete(params.id)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Quiz deleted" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
