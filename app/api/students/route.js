// import { NextResponse } from "next/server"
// import connectDB from "@/lib/db"
// import Student from "@/models/Student"

// export async function GET(request) {
//   try {
//     await connectDB()

//     const { searchParams } = new URL(request.url)
//     const search = searchParams.get("search")
//     const classFilter = searchParams.get("class")
//     const section = searchParams.get("section")
//     const status = searchParams.get("status")
//     const page = Number.parseInt(searchParams.get("page")) || 1
//     const limit = Number.parseInt(searchParams.get("limit")) || 50

//     const query = {}

//     if (search) {
//       query.$text = { $search: search }
//     }

//     if (classFilter) {
//       query.class = classFilter
//     }

//     if (section) {
//       query.section = section
//     }

//     if (status) {
//       query.status = status
//     } else {
//       query.status = { $ne: "Inactive" }
//     }

//     const students = await Student.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean()

//     const total = await Student.countDocuments(query)

//     return NextResponse.json({
//       students,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     })
//   } catch (error) {
//     console.error("Error fetching students:", error)
//     return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
//   }
// }

// export async function POST(request) {
//   try {
//     await connectDB()

//     const data = await request.json()

//     // Check for duplicate roll number
//     const existingRoll = await Student.findOne({ rollNumber: data.rollNumber })
//     if (existingRoll) {
//       return NextResponse.json({ error: "Roll number already exists" }, { status: 400 })
//     }

//     // Check for duplicate registration number
//     const existingReg = await Student.findOne({ registrationNumber: data.registrationNumber })
//     if (existingReg) {
//       return NextResponse.json({ error: "Registration number already exists" }, { status: 400 })
//     }

//     const student = new Student(data)
//     await student.save()

//     return NextResponse.json(student, { status: 201 })
//   } catch (error) {
//     console.error("Error creating student:", error)
//     return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";

// =========================
//        GET STUDENTS
// =========================
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");
    const status = searchParams.get("status"); // "Admitted", "Active", "Inactive"
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 50;

    const query = {};

    // 🔍 Search by text (name, father name, phone, etc.)
    if (search) query.$text = { $search: search };

    if (classFilter) query.class = classFilter;

    if (section) query.section = section;

    // ⭐ ADMISSION-RELATED LOGIC
    if (status) {
      query.status = status; // "Admitted", "Active", "Inactive"
    } else {
      // Default: show only current/active admission students
      query.status = { $in: ["Admitted", "Active"] };
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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

// =========================
//     CREATE STUDENT
//   (ADMISSION ENTRY)
// =========================
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    // 🔐 Duplicate roll number check
    const existingRoll = await Student.findOne({
      rollNumber: data.rollNumber,
      class: data.class, // Roll numbers can repeat in different classes
      section: data.section,
    });

    if (existingRoll) {
      return NextResponse.json(
        { error: "Roll number already exists in this class & section" },
        { status: 400 }
      );
    }

    // 🔐 Duplicate Registration number check
    const existingReg = await Student.findOne({
      registrationNumber: data.registrationNumber,
    });

    if (existingReg) {
      return NextResponse.json(
        { error: "Registration number already exists" },
        { status: 400 }
      );
    }

    // ⭐ Automatic admission logic
    const student = new Student({
      ...data,
      status: "Active", // Default status for new admissions
      admissionDate: data.admissionDate || new Date(),
      admissionYear: new Date().getFullYear(),
    });

    await student.save();

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
