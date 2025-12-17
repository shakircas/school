import { NextResponse } from "next/server";
import Subject from "@/models/Subject";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
// export async function GET() {
//   await connectDB();
//   const data = await Subject.find().lean();
//   return NextResponse.json({ data });
// }
export async function GET() {
  try {
    await connectDB();

    const subjects = await Subject.find()
      .populate("classes", "name") // ✅ only get name
      .populate("teachers", "name"); // optional

    return NextResponse.json({ data: subjects });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// export async function POST(req) {
//   try {
//     await connectDB();
//     const body = await req.json();
//     const sub = await Subject.create(body);
//     return NextResponse.json({ data: sub });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

// export async function GET() {
//   try {
//     await connectDB();

//     const data = await Subject.find()
//       .populate("classes", "name section academicYear")
//       .populate("teachers", "name email")
//       .lean();
// console.log(data)
//     return NextResponse.json({ data });
//   } catch (err) {
//     return NextResponse.json(
//       { error: "Failed to fetch subjects" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     const updated = await Subject.findByIdAndUpdate(body._id, body, {
//       new: true,
//     });

//     return NextResponse.json({ data: updated });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body._id) {
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

    /* ---------- VALIDATE CLASSES ---------- */
    if (body.classes?.length) {
      const classCount = await Class.countDocuments({
        _id: { $in: body.classes },
      });

      if (classCount !== body.classes.length) {
        return NextResponse.json(
          { error: "One or more selected classes do not exist" },
          { status: 400 }
        );
      }
    }

    const MAX_PERIODS_PER_TEACHER = 30;

    for (const teacherId of body.teachers || []) {
      const subjects = await Subject.find({
        teachers: teacherId,
        _id: { $ne: body._id },
      });

      const totalPeriods =
        subjects.reduce((sum, s) => sum + s.periods, 0) + body.periods;

      if (totalPeriods > MAX_PERIODS_PER_TEACHER) {
        return NextResponse.json(
          {
            error: `Teacher exceeds weekly limit (${MAX_PERIODS_PER_TEACHER})`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await Subject.findByIdAndUpdate(body._id, body, {
      new: true,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Subject.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

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

    /* ---------- VALIDATE CLASSES ---------- */
    if (body.classes?.length) {
      const classCount = await Class.countDocuments({
        _id: { $in: body.classes },
      });

      if (classCount !== body.classes.length) {
        return NextResponse.json(
          { error: "One or more selected classes do not exist" },
          { status: 400 }
        );
      }
    }

    const MAX_PERIODS_PER_TEACHER = 30;

    for (const teacherId of body.teachers || []) {
      const subjects = await Subject.find({
        teachers: teacherId,
        _id: { $ne: body._id },
      });

      const totalPeriods =
        subjects.reduce((sum, s) => sum + s.periods, 0) + body.periods;

      if (totalPeriods > MAX_PERIODS_PER_TEACHER) {
        return NextResponse.json(
          {
            error: `Teacher exceeds weekly limit (${MAX_PERIODS_PER_TEACHER})`,
          },
          { status: 400 }
        );
      }
    }

    const sub = await Subject.create(body);
    return NextResponse.json({ data: sub }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
