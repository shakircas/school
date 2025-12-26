// /app/api/academics/timetable/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";

e// /app/api/academics/timetable/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connectDB();

    const data = await Class.find(
      {},
      { name: 1, schedule: 1 }
    ).populate({
      path: "schedule.periods.teacher",
      model: "Teacher",
      select: "name",
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("timetable GET error", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}


// POST: replace full schedule for class
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { classId, schedule } = body;
    if (!classId)
      return NextResponse.json({ error: "classId required" }, { status: 400 });

    const cls = await Class.findById(classId);
    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    cls.schedule = Array.isArray(schedule) ? schedule : cls.schedule;
    await cls.save();
    return NextResponse.json({ data: cls });
  } catch (err) {
    console.error("timetable POST error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: remove a single period by day+index or by periodId if provided
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const body = await req.json().catch(() => ({}));
    const { day, index, periodId } = body;

    if (!classId)
      return NextResponse.json({ error: "classId required" }, { status: 400 });

    const cls = await Class.findById(classId);
    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    if (periodId) {
      // remove by period._id
      cls.schedule.forEach((d) => {
        d.periods = d.periods.filter((p) => String(p._id) !== String(periodId));
      });
    } else if (typeof day === "string" && typeof index === "number") {
      const dayObj = cls.schedule.find((d) => d.day === day);
      if (dayObj && dayObj.periods && dayObj.periods[index]) {
        dayObj.periods.splice(index, 1);
      }
    } else {
      return NextResponse.json(
        { error: "Provide periodId OR day+index" },
        { status: 400 }
      );
    }

    await cls.save();
    return NextResponse.json({ data: cls });
  } catch (err) {
    console.error("timetable DELETE error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
