import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const examId = searchParams.get("examId");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const student = searchParams.get("student"); // name / roll search
    const academicYear = searchParams.get("academicYear");

    const query = {};

    if (examId) query.exam = examId;
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (academicYear) query.academicYear = academicYear;

    let results = await Result.find(query)
      .populate("exam", "name examType")
      .populate("student", "name rollNumber")
      .populate("classId", "name section")
      
      .sort({ createdAt: -1 })
      .lean();

    // 🔍 Student name / roll search (safe)
    if (student) {
      const term = student.toLowerCase();
      results = results.filter(
        (r) =>
          r.student?.name?.toLowerCase().includes(term) ||
          r.student?.rollNumber?.toLowerCase().includes(term)
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { exam, student, classId, sectionId, academicYear, subjects } = body;

    if (!exam || !student || !classId || !sectionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let totalMarks = 0;
    let obtainedMarks = 0;

    const processedSubjects = subjects.map((s) => {
      // ✅ FORCE INTEGER MARKS
      const subjectTotal = Number(s.totalMarks);
      const subjectObtained = Number(s.obtainedMarks);

      const percentage =
        subjectTotal > 0 ? (subjectObtained / subjectTotal) * 100 : 0;

      totalMarks += subjectTotal;
      obtainedMarks += subjectObtained;

      return {
        ...s,
        totalMarks: subjectTotal,
        obtainedMarks: subjectObtained,
        percentage,
        grade: calculateGrade(percentage),
      };
    });

    // ✅ FINAL PERCENTAGE
   const percentage = Number(((obtainedMarks / totalMarks) * 100).toFixed(2));


    // 🔍 FIND EXISTING RESULT (student + exam)
    const existingResult = await Result.findOne({
      exam,
      student,
    });

    if (existingResult) {
      // 🔁 UPDATE EXISTING RESULT
      existingResult.subjects = processedSubjects;
      existingResult.totalMarks = totalMarks;
      existingResult.obtainedMarks = obtainedMarks;
      existingResult.percentage = percentage;
      existingResult.grade = calculateGrade(percentage);
      existingResult.status = percentage >= 33 ? "Pass" : "Fail";
      existingResult.academicYear = academicYear;

      await existingResult.save();

      return NextResponse.json(
        { data: existingResult, updated: true },
        { status: 200 }
      );
    }

    // ➕ CREATE NEW RESULT
    const result = await Result.create({
      exam,
      student,
      classId,
      sectionId,
      academicYear,
      subjects: processedSubjects,
      totalMarks,
      obtainedMarks,
      percentage,
      grade: calculateGrade(percentage),
      status: percentage >= 33 ? "Pass" : "Fail",
    });

    return NextResponse.json({ data: result, created: true }, { status: 201 });
  } catch (err) {
    console.error(err);

    // 🛑 UNIQUE INDEX SAFETY NET
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Result already exists for this student and exam" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}


function calculateGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 33) return "E";
  return "F";
}

// export async function PUT(req) {
//   await connectDB();
//   const { id, subjects } = await req.json();

//   let totalMarks = 0;
//   let obtainedMarks = 0;

//   const processedSubjects = subjects.map((s) => {
//     totalMarks += s.totalMarks;
//     obtainedMarks += s.obtainedMarks;
//     const percentage = (s.obtainedMarks / s.totalMarks) * 100;

//     return {
//       ...s,
//       percentage,
//       grade: calculateGrade(percentage),
//     };
//   });

//   const percentage = (obtainedMarks / totalMarks) * 100;

//   const result = await Result.findByIdAndUpdate(
//     id,
//     {
//       subjects: processedSubjects,
//       totalMarks,
//       obtainedMarks,
//       percentage,
//       grade: calculateGrade(percentage),
//       status: percentage >= 33 ? "Pass" : "Fail",
//     },
//     { new: true }
//   );

//   return NextResponse.json({ data: result });
// }

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  await Result.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
