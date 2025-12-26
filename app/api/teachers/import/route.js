import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";
import { parseTeacherFile } from "@/lib/import/teacherImport";

export async function POST(req) {
  await dbConnect();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "File missing" }, { status: 400 });
  }

  const teachers = await parseTeacherFile(file);

  const inserted = [];
  const skipped = [];

  for (const t of teachers) {
    try {
      await Teacher.create(t);
      inserted.push(t.personalNo);
    } catch (err) {
      skipped.push({
        personalNo: t.personalNo,
        reason: err.code === 11000 ? "Duplicate" : err.message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    inserted: inserted.length,
    skipped,
  });
}
