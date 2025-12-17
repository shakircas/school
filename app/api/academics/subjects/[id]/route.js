import { NextResponse } from "next/server";
import Subject from "@/models/Subject";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params; // ✅ comes from URL
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    /* ---------- VALIDATE TEACHERS ---------- */
    if (body.teachers?.length) {
      const teacherCount = await Teacher.countDocuments({
        _id: { $in: body.teachers },
      });

      if (teacherCount !== body.teachers.length) {
        return NextResponse.json(
          { error: "One or more assigned teachers do not exist" },
          { status: 400 }
        );
      }
    }

    /* ---------- PERIOD VALIDATION ---------- */
    const MAX_PERIODS_PER_TEACHER = 30;

    for (const teacherId of body.teachers || []) {
      const subjects = await Subject.find({
        teachers: teacherId,
        _id: { $ne: id },
      });

      const totalPeriods =
        subjects.reduce((sum, s) => sum + (s.periods || 0), 0) +
        (body.periods || 0);

      if (totalPeriods > MAX_PERIODS_PER_TEACHER) {
        return NextResponse.json(
          {
            error: `Teacher exceeds weekly limit (${MAX_PERIODS_PER_TEACHER})`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await Subject.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    await Subject.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
