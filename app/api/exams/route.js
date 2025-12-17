import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";

/**
 * GET /api/exams?classId=...&sectionId=...&academicYear=...&status=...&examType=...
 * POST /api/exams           -> create
 * PUT /api/exams            -> update (body must contain _id)
 * DELETE /api/exams?id=...  -> delete
 */

function parseDateIfExists(val) {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const academicYear = searchParams.get("academicYear");
    const status = searchParams.get("status");
    const examType = searchParams.get("examType");

    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;
    if (examType) query.examType = examType;

    const exams = await Exam.find(query).sort({ startDate: -1 }).lean();

    return NextResponse.json({ data: exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.name)
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!body.examType)
      return NextResponse.json(
        { error: "examType is required" },
        { status: 400 }
      );
    if (!body.academicYear)
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 }
      );
    if (!body.classId)
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    if (!body.sectionId)
      return NextResponse.json(
        { error: "sectionId is required" },
        { status: 400 }
      );
    if (!body.startDate)
      return NextResponse.json(
        { error: "startDate is required" },
        { status: 400 }
      );
    if (!body.endDate)
      return NextResponse.json(
        { error: "endDate is required" },
        { status: 400 }
      );

    // Normalize dates
    body.startDate = parseDateIfExists(body.startDate) || new Date();
    body.endDate = parseDateIfExists(body.endDate) || body.startDate;

    // Parse schedule if present
    if (Array.isArray(body.schedule)) {
      body.schedule = body.schedule.map((s) => ({
        subject: s.subject || "",
        date: parseDateIfExists(s.date) || null,
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        venue: s.venue || "",
        totalMarks:
          typeof s.totalMarks === "number"
            ? s.totalMarks
            : Number(s.totalMarks) || 0,
        passingMarks:
          typeof s.passingMarks === "number"
            ? s.passingMarks
            : Number(s.passingMarks) || 0,
        invigilator: s.invigilator || "",
      }));
    }

    const exam = new Exam(body);
    await exam.save();

    return NextResponse.json({ data: exam }, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body._id)
      return NextResponse.json(
        { error: "_id is required for update" },
        { status: 400 }
      );

    // Normalize dates if passed
    if (body.startDate) body.startDate = parseDateIfExists(body.startDate);
    if (body.endDate) body.endDate = parseDateIfExists(body.endDate);

    if (Array.isArray(body.schedule)) {
      body.schedule = body.schedule.map((s) => ({
        subject: s.subject || "",
        date: parseDateIfExists(s.date) || null,
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        venue: s.venue || "",
        totalMarks:
          typeof s.totalMarks === "number"
            ? s.totalMarks
            : Number(s.totalMarks) || 0,
        passingMarks:
          typeof s.passingMarks === "number"
            ? s.passingMarks
            : Number(s.passingMarks) || 0,
        invigilator: s.invigilator || "",
      }));
    }

    const updated = await Exam.findByIdAndUpdate(body._id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { error: "id query param is required" },
        { status: 400 }
      );

    await Exam.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
