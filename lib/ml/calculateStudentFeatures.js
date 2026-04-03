import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import StudentFeature from "@/models/StudentFeature";

export async function calculateStudentFeatures(studentId, academicYear) {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const result = await Attendance.aggregate([
    {
      $match: {
        // academicYear,
        type: "Student",
        "records.personId": studentObjectId,
      },
    },

    {
      $facet: {
        attendance: [
          { $unwind: "$records" },

          {
            $match: {
              "records.personId": studentObjectId,
            },
          },

          {
            $group: {
              _id: null,
              totalDays: { $sum: 1 },
              presentDays: {
                $sum: {
                  $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0],
                },
              },
            },
          },

          {
            $project: {
              attendance: {
                $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
              },
            },
          },
        ],

        results: [
          {
            $lookup: {
              from: "results",
              let: { studentId: studentObjectId },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$student", "$$studentId"],
                    },
                  },
                },

                {
                  $lookup: {
                    from: "exams",
                    localField: "exam",
                    foreignField: "_id",
                    as: "examData",
                  },
                },

                { $unwind: "$examData" },

                {
                  $match: {
                    // "examData.academicYear": academicYear,
                  },
                },

                {
                  $group: {
                    _id: "$examData.examType",

                    avgPercentage: { $avg: "$percentage" },

                    firstPercentage: { $first: "$percentage" },
                  },
                },
              ],
              as: "examResults",
            },
          },
        ],
      },
    },
  ]);

  const attendance = result?.[0]?.attendance?.[0]?.attendance || 0;

  const examResults = result?.[0]?.results?.[0]?.examResults || [];
  console.log("exam Results", examResults);

  let midterm = 0;
  let previous_exam = 0;
  let unit_avg = 0;

  examResults.forEach((r) => {
    if (r._id === "Mid Term") midterm = r.firstPercentage;

    if (r._id === "Final") previous_exam = r.firstPercentage;

    if (r._id === "Unit Test") unit_avg = r.avgPercentage;
  });

  await StudentFeature.findOneAndUpdate(
    {
      student: studentObjectId,
      academicYear,
    },

    {
      attendance,
      midterm,
      unit_avg,
      previous_exam,
      updatedAt: new Date(),
    },

    {
      upsert: true,
      new: true,
    },
  );

  console.log(attendance, midterm, unit_avg, previous_exam);

  return {
    attendance,
    midterm,
    unit_avg,
    previous_exam,
  };
}
