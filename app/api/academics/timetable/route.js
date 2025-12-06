import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { connectDB } from "@/lib/db";

export async function GET() {
  await dbConnection();
  const data = await Class.find({}, { name: 1, schedule: 1 });
  return NextResponse.json({ data });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const cls = await Class.findById(body.classId);

    cls.schedule = body.schedule; // full timetable update
    await cls.save();

    return NextResponse.json({ data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
