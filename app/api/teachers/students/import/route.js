// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Student from "@/models/Student";
// import bcrypt from "bcrypt";
// import * as XLSX from "xlsx";

// export async function POST(req) {
//   const session = await auth();

//   if (!session || session.user.role !== "teacher") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   const formData = await req.formData();
//   const file = formData.get("file");

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const workbook = XLSX.read(buffer, { type: "buffer" });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rows = XLSX.utils.sheet_to_json(sheet);

//   const created = [];
//   const errors = [];

//   for (const row of rows) {
//     try {
//       const exists = await User.findOne({ email: row.email });
//       if (exists) throw new Error("Email exists");

//       const password = row.rollNumber + "@123";
//       const hashed = await bcrypt.hash(password, 10);

//       const user = await User.create({
//         name: row.name,
//         email: row.email,
//         password: hashed,
//         role: "student",
//       });

//       const student = await Student.create({
//         name: row.name,
//         rollNumber: row.rollNumber,
//         class: row.class,
//         section: row.section,
//         user: user._id,
//         createdBy: session.user.id,
//       });

//       user.student = student._id;
//       await user.save();

//       created.push({
//         name: row.name,
//         email: row.email,
//         password, // return once only
//       });
//     } catch (err) {
//       errors.push({ email: row.email, error: err.message });
//     }
//   }

//   return NextResponse.json({
//     success: true,
//     createdCount: created.length,
//     created,
//     errors,
//   });
// }

import { connectDB } from "@/lib/db";
import { createStudentWithUser } from "@/lib/services/student.service";
import { auth } from "@/auth";
import * as xlsx from "xlsx";
import Class from "@/models/Class";

export async function POST(req) {
  await connectDB();

  const sessionUser = await auth();
  if (!sessionUser || !["admin", "teacher"].includes(sessionUser.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // IMPORTANT: defval ensures empty cells don't become undefined
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const results = {
    success: 0,
    failed: [],
  };

  for (const [index, rawRow] of rows.entries()) {
    try {
      const classDoc = await Class.findOne({ name: rawRow.class });

      if (!classDoc) {
        throw new Error(`Class not found: ${rawRow.class}`);
      }

      /* ===============================
       AUTO-CREATE SECTION
    =============================== */

      const sectionName = String(rawRow.section).trim();

      const sectionExists = classDoc.sections?.some(
        (s) => s.name === sectionName
      );

      if (!sectionExists) {
        classDoc.sections.push({ name: sectionName });
        await classDoc.save();
      }

      await createStudentWithUser({
        studentData: {
          rollNumber: rawRow.rollNumber,
          registrationNumber: rawRow.registrationNumber,
          name: rawRow.name,
          classId: classDoc._id,
          sectionId: sectionName,
          fatherName: rawRow.fatherName,
          phone: rawRow.phone,
          email: rawRow.email,
          gender: rawRow.gender || "Male",
          dateOfBirth: new Date(rawRow.dateOfBirth),
        },
        createUser: true,
        createdBy: sessionUser.user.id,
      });

      results.success++;
    } catch (err) {
      results.failed.push({
        row: index + 2,
        error: err.message,
      });
    }
  }

  return Response.json(results);
}

// await createStudentWithUserTx({
//   studentData: row,
//   createUser: true,
// });
