import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();
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

export async function DELETE(req) {
  try {
    await connectDB();
    const { classId, day, index } = await req.json();

    const cls = await Class.findById(classId);
    if (!cls) throw new Error("Class not found");

    const schedule = cls.schedule || [];
    const targetDay = schedule.find((d) => d.day === day);

    if (targetDay) {
      targetDay.periods.splice(index, 1); // remove selected period

      // If no periods left, remove day entirely
      if (targetDay.periods.length === 0) {
        cls.schedule = schedule.filter((d) => d.day !== day);
      }
    }

    await cls.save();

    return NextResponse.json({ success: true, data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
