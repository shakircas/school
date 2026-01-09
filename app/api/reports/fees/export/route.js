import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const academicYear = searchParams.get("academicYear");
    const month = searchParams.get("month");
    const status = searchParams.get("status");

    const query = {};

    if (classId && classId !== "all") query.classId = classId;
    if (sectionId && sectionId !== "all") query.sectionId = sectionId;
    if (academicYear) query.academicYear = academicYear;
    if (month) query.month = month;
    if (status && status !== "All") query.status = status;

    const fees = await Fee.find(query)
      .populate("student", "name rollNumber fatherName phone")
      .populate("classId", "name academicYear")
      .lean();

    const rows = fees.map((f) => ({
      RollNumber: f.student?.rollNumber || "-",
      StudentName: f.student?.name || "-",
      FatherName: f.student?.fatherName || "-",
      Phone: f.student?.phone || "-",
      Class: f.classId ? `${f.classId.name} (${f.classId.academicYear})` : "-",
      Section: f.sectionId,
      Month: f.month,
      TotalAmount: f.totalAmount,
      PaidAmount: f.paidAmount,
      DueAmount: f.dueAmount,
      Status: f.status,
      DueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-",
    }));

    return NextResponse.json({ rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to export fee report" },
      { status: 500 }
    );
  }
}
