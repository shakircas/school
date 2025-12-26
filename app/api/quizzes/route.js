import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Quiz from "@/models/Quiz"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const subject = searchParams.get("subject")
    const status = searchParams.get("status")

    const query = {}

    if (classFilter) {
      query.class = classFilter
    }

    if (subject) {
      query.subject = subject
    }

    if (status) {
      query.status = status
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

// export async function POST(request) {
//   try {
//     await connectDB()

//     const data = await request.json()

//     const quiz = new Quiz(data)
//     await quiz.save()

//     return NextResponse.json(quiz, { status: 201 })
//   } catch (error) {
//     console.error("Error creating quiz:", error)
//     return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
//   }
// }

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.totalMarks) {
      data.totalMarks = data.questions?.length || 0;
    }

    if (!data.passingMarks) {
      data.passingMarks = Math.ceil(data.totalMarks * 0.4);
    }

    if (data.status) {
      data.status = data.status.charAt(0).toUpperCase() + data.status.slice(1);
    }

    const quiz = new Quiz(data);
    await quiz.save();

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
