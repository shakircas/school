import { NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // Your DB connection helper
import Result from "@/models/Result";
import Student from "@/models/Student"; // Need this to find by Roll No
import Exam from "@/models/Exam"; // Needed for population

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { rollNo } = await params;

    console.log(rollNo);

    // 1. Find student by roll number
    const student = await Student.findOne({ rollNumber: rollNo });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    console.log(student);
    // 2. Find the latest published result for this student
    const result = await Result.findOne({
      student: student._id,
    })
      .populate("exam", "name title") // Get Exam name (e.g., Annual 2026)
      .populate("classId", "name") // Get Class name (e.g., 9th)
      .sort({ createdAt: -1 }); // Get the most recent

    if (!result) {
      return NextResponse.json(
        { error: "Result not published yet" },
        { status: 404 }
      );
    }

    console.log("result", result);

    const totalObtainedMarks = result.subjects.reduce(
      (sum, s) => sum + (s.isAbsent ? 0 : s.obtainedMarks),
      0
    );

    const totalMaxMarks = result.subjects.reduce(
      (sum, s) => sum + s.totalMarks,
      0
    );


    // 3. Combine student info with result info
   const responseData = {
     name: student.name,
     fatherName: student.fatherName,
     rollNumber: student.rollNumber,
     examName: result.exam?.name,
     className: result.classId?.name,
     subjects: result.subjects,

     obtainedMarks: totalObtainedMarks,
     totalMarks: totalMaxMarks,

     percentage: result.percentage,
     grade: result.grade,
     status: result.status,
     teacherRemarks: result.teacherRemarks,
   };


    console.log("response", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Result Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
