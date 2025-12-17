import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { connectDB } from "@/lib/db";

// Delete period
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { classId } = params;
    const { day, index } = await req.json();

    const cls = await Class.findById(classId);
    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const targetDay = cls.schedule.find((d) => d.day === day);
    if (!targetDay)
      return NextResponse.json({ error: "Day not found" }, { status: 404 });

    targetDay.periods.splice(index, 1);
    await cls.save();

    return NextResponse.json({ data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// Edit period
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { classId } = await params;

    const { day, index, time, subject, teacher } = await req.json();

    const cls = await Class.findById(classId);
    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const targetDay = cls.schedule.find((d) => d.day === day);
    if (!targetDay)
      return NextResponse.json({ error: "Day not found" }, { status: 404 });

    targetDay.periods[index] = { time, subject, teacher };
    await cls.save();

    return NextResponse.json({ data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
