import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year required" },
      { status: 400 }
    );
  }

  // Get all teachers
  const teachers = await Teacher.find().sort({ name: 1 });

  // Get all classes with schedules and periods
  const classes = await Class.find({}).lean();

  // Build a map of teacher attendance based on schedule
  const attendanceDocs = [];

  classes.forEach((cls) => {
    cls.schedule.forEach((daySchedule) => {
      // Get all days in month
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

        if (daySchedule.day === dayName) {
          daySchedule.periods.forEach((period) => {
            attendanceDocs.push({
              teacher: period.teacher,
              date,
              className: cls.name,
              subject: period.subjectName,
              time: period.time,
            });
          });
        }
      }
    });
  });

  return NextResponse.json({
    teachers,
    attendanceDocs,
    daysInMonth: new Date(year, month, 0).getDate(),
  });
}




// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Class from "@/models/Class";
// import Teacher from "@/models/Teacher";

// export async function GET(req) {
//   await connectDB();

//   const { searchParams } = new URL(req.url);
//   const month = Number(searchParams.get("month"));
//   const year = Number(searchParams.get("year"));

//   if (!month || !year) {
//     return NextResponse.json(
//       { error: "Month and year required" },
//       { status: 400 }
//     );
//   }

//   // 1️⃣ Get teachers
//   const teachers = await Teacher.find().sort({ name: 1 }).lean();

//   // 2️⃣ Get all classes with schedules and periods
//   const classes = await Class.find({}).lean();

//   // 3️⃣ Days in month
//   const daysInMonth = new Date(year, month, 0).getDate();

//   // 4️⃣ Build teacher-centric attendance
//   const teacherAttendance = teachers.map((t) => {
//     const attendance = {};

//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(year, month - 1, d);
//       const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

//       // Find all periods for this teacher on this day
//       const periodsForDay = [];

//       classes.forEach((cls) => {
//         cls.schedule.forEach((daySchedule) => {
//           if (daySchedule.day === dayName) {
//             daySchedule.periods.forEach((period) => {
//               if (period.teacher.toString() === t._id.toString()) {
//                 periodsForDay.push({
//                   className: cls.name,
//                   subject: period.subjectName,
//                   time: period.time,
//                 });
//               }
//             });
//           }
//         });
//       });

//       attendance[d] = periodsForDay; // map day number → array of periods
//     }

//     return {
//       teacherId: t._id,
//       teacherName: t.name,
//       attendance,
//     };
//   });

//   return NextResponse.json({
//     daysInMonth,
//     teacherAttendance,
//   });
// }
