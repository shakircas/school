import mongoose from "mongoose";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function createStudentWithUser({
  studentData,
  createUser = false,
  createdBy,
}) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /* =====================
       DUPLICATE CHECKS
    ====================== */

    const rollExists = await Student.findOne(
      {
        rollNumber: studentData.rollNumber,
        classId: studentData.classId,
        sectionId: studentData.sectionId,
      },
      null,
      { session }
    );

    if (rollExists) {
      throw new Error("Roll number already exists in this class & section");
    }

    const regExists = await Student.findOne(
      { registrationNumber: studentData.registrationNumber },
      null,
      { session }
    );

    if (regExists) {
      throw new Error("Registration number already exists");
    }

    /* =====================
       CREATE STUDENT
    ====================== */

    const student = await Student.create(
      [
        {
          ...studentData,
          admissionDate: studentData.admissionDate || new Date(),
          admissionYear: new Date().getFullYear(),
          createdBy,
        },
      ],
      { session }
    );

    let user = null;

    /* =====================
       CREATE USER (OPTIONAL)
    ====================== */

    if (createUser) {
      const email =
        studentData.email || `${studentData.rollNumber}@student.school.com`;

      const rawPassword = Math.random().toString(36).slice(-8);

      user = await User.create(
        [
          {
            name: studentData.name,
            email,
            password: await bcrypt.hash(rawPassword, 10),
            role: "student",
            student: student[0]._id,
            rollNumber: studentData.rollNumber,
            class: studentData.admissionClass,
          },
        ],
        { session }
      );

      student[0].user = user[0]._id;
      await student[0].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      student: student[0],
      user: user?.[0],
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

export async function getStudentWithUser(studentId) {
  const student = await Student.findById(studentId).populate("userId");
  return student;
}

// import mongoose from "mongoose";
// import Student from "@/models/Student";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";
// import { sendStudentCredentials } from "@/lib/services/notify.service";

// export async function createStudentWithUserTx({
//   studentData,
//   createUser = false,
// }) {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     /* ================= DUPLICATE CHECK ================= */

//     const rollExists = await Student.findOne(
//       { rollNo: studentData.rollNo },
//       null,
//       { session }
//     );

//     if (rollExists) {
//       throw new Error(`Duplicate Roll No: ${studentData.rollNo}`);
//     }

//     if (createUser && studentData.email) {
//       const emailExists = await User.findOne(
//         { email: studentData.email },
//         null,
//         { session }
//       );

//       if (emailExists) {
//         throw new Error(`Duplicate Email: ${studentData.email}`);
//       }
//     }

//     /* ================= CREATE STUDENT ================= */

//     const student = await Student.create([{ ...studentData }], { session });

//     let user = null;
//     let rawPassword = null;

//     /* ================= CREATE USER ================= */

//     if (createUser) {
//       rawPassword = Math.random().toString(36).slice(-8);

//       user = await User.create(
//         [
//           {
//             name: studentData.name,
//             email:
//               studentData.email || `${studentData.rollNo}@student.school.com`,
//             password: await bcrypt.hash(rawPassword, 10),
//             role: "student",
//             studentId: student[0]._id,
//           },
//         ],
//         { session }
//       );

//       student[0].userId = user[0]._id;
//       await student[0].save({ session });
//     }

//     /* ================= COMMIT ================= */

//     await session.commitTransaction();
//     session.endSession();

//     /* ================= NOTIFICATIONS ================= */

//     if (createUser) {
//       await sendStudentCredentials({
//         name: studentData.name,
//         email: user[0].email,
//         password: rawPassword,
//         phone: studentData.phone,
//       });
//     }

//     return {
//       student: student[0],
//       user: user?.[0],
//     };
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     throw err;
//   }
// }
