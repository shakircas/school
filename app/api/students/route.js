// =========================
//        GET STUDENTS
// =========================
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { createStudentWithUser } from "@/lib/services/student.service";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const status = searchParams.get("status");

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
        { fatherName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    /* 🏫 CLASS FILTER */
    if (
      classId &&
      classId !== "all" &&
      mongoose.Types.ObjectId.isValid(classId)
    ) {
      query.classId = classId;
    }

    /* 🅰️ SECTION FILTER */
    if (sectionId && sectionId !== "all") {
      query.sectionId = sectionId;
    }

    /* ⭐ STATUS FILTER */
    if (status && status !== "all") {
      query.status = status;
    } else {
      query.status = { $in: ["Admitted", "Active"] };
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean().populate("classId", "name");

    const total = await Student.countDocuments(query);

    return NextResponse.json({
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// // =========================
// //     CREATE STUDENT
// //   (ADMISSION ENTRY)
// // =========================
// export async function POST(request) {
//   const session = await auth();
//   try {
//     await connectDB();

//      if (!["admin", "teacher"].includes(session.user.role)) {
//        return Response.json({ error: "Forbidden" }, { status: 403 });
//      }


//     const data = await request.json();

//     // 🔐 Duplicate roll number check
//     const existingRoll = await Student.findOne({
//       rollNumber: data.rollNumber,
//       class: data.class, // Roll numbers can repeat in different classes
//       section: data.section,
//     });

//     if (existingRoll) {
//       return NextResponse.json(
//         { error: "Roll number already exists in this class & section" },
//         { status: 400 }
//       );
//     }

//     // 🔐 Duplicate Registration number check
//     const existingReg = await Student.findOne({
//       registrationNumber: data.registrationNumber,
//     });

//     if (existingReg) {
//       return NextResponse.json(
//         { error: "Registration number already exists" },
//         { status: 400 }
//       );
//     }

//     // ⭐ Automatic admission logic
//     const student = new Student({
//       ...data,
//       // status: "Active", // Default status for new admissions
//       admissionDate: data.admissionDate || new Date(),
//       admissionYear: new Date().getFullYear(),
//     });

//     //  const result = await createStudentWithUser({
//     //    studentData: body,
//     //    createUser: body.createAccount === true, // checkbox in UI
//     //  });

//     await student.save();

//     return NextResponse.json(student, { status: 201 });
//   } catch (error) {
//     console.error("Error creating student:", error);
//     return NextResponse.json(
//       { error: "Failed to create student" },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import { connectDB } from "@/lib/db";
// import { createStudentWithUser } from "@/lib/services/student.service";

export async function POST(request) {
  const session = await auth();

  if (!session || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const data = await request.json();

    const result = await createStudentWithUser({
      studentData: data,
      createUser: data.createAccount === true,
      createdBy: session.user.id,
    });

    return NextResponse.json(result.student, { status: 201 });
  } catch (error) {
    console.error("Student creation error:", error.message);

    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 400 }
    );
  }
}
