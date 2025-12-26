import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { connectDB } from "@/lib/db";

// Delete period
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { classId } = await params;
    const { day, index } = await req.json();

    const cls = await Class.findById(classId);
    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const targetDay = cls.schedule.find((d) => d.day === day);
    if (!targetDay)
      return NextResponse.json({ error: "Day not found" }, { status: 404 });

    if (!targetDay.periods[index]) {
      return NextResponse.json(
        { error: "Invalid period index" },
        { status: 400 }
      );
    }

    targetDay.periods.splice(index, 1);
    await cls.save();

    return NextResponse.json({ data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// Edit period
// export async function PATCH(req, { params }) {
//   try {
//     await connectDB();
//     const { classId } = await params;

//     const { day, index, time, subject, teacher } = await req.json();

//     const cls = await Class.findById(classId);
//     if (!cls)
//       return NextResponse.json({ error: "Class not found" }, { status: 404 });

//     const targetDay = cls.schedule.find((d) => d.day === day);
//     if (!targetDay)
//       return NextResponse.json({ error: "Day not found" }, { status: 404 });

//     targetDay.periods[index] = { time, subject, teacher };
//     await cls.save();

//     return NextResponse.json({ data: cls });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

// Edit period (SAFE & SCHEMA-CORRECT)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { classId } = await params;

    const { day, index, time, subjectId, subjectName, teacher } =
      await req.json();

    if (!day || index === undefined) {
      return NextResponse.json(
        { error: "Day and index are required" },
        { status: 400 }
      );
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // ✅ Ensure day exists
    let targetDay = cls.schedule.find((d) => d.day === day);
    if (!targetDay) {
      targetDay = { day, periods: [] };
      cls.schedule.push(targetDay);
    }

    if (!targetDay.periods[index]) {
      return NextResponse.json(
        { error: "Invalid period index" },
        { status: 400 }
      );
    }

    // ✅ Update only fields (DO NOT overwrite object)
    const period = targetDay.periods[index];

    period.time = time ?? period.time;
    period.subjectId = subjectId ?? period.subjectId;
    period.subjectName = subjectName ?? period.subjectName;
    period.teacher = teacher ?? period.teacher;

    await cls.save();

    return NextResponse.json({ data: cls });
  } catch (err) {
    console.error("PATCH timetable error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
