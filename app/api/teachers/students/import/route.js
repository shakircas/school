import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import bcrypt from "bcrypt";
import * as XLSX from "xlsx";

export async function POST(req) {
  const session = await auth();

  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const created = [];
  const errors = [];

  for (const row of rows) {
    try {
      const exists = await User.findOne({ email: row.email });
      if (exists) throw new Error("Email exists");

      const password = row.rollNumber + "@123";
      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: row.name,
        email: row.email,
        password: hashed,
        role: "student",
      });

      const student = await Student.create({
        name: row.name,
        rollNumber: row.rollNumber,
        class: row.class,
        section: row.section,
        user: user._id,
        createdBy: session.user.id,
      });

      user.student = student._id;
      await user.save();

      created.push({
        name: row.name,
        email: row.email,
        password, // return once only
      });
    } catch (err) {
      errors.push({ email: row.email, error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    createdCount: created.length,
    created,
    errors,
  });
}
