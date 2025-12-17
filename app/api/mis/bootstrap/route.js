import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import ClassModel from "@/models/Class";
import Subject from "@/models/Subject";
import Exam from "@/models/Exam";
// import Timetable from "@/models/Timetable";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();

  const students = await Student.find();
  const teachers = await Teacher.find();
  const classes = await ClassModel.find();
  const subjects = await Subject.find();
  const exams = await Exam.find();
  //   const timetable = await Timetable.find();

  return Response.json({
    students,
    teachers,
    classes,
    subjects,
    exams,
    // timetable,
  });
}
