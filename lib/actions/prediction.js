"use server";

import Attendance from "@/models/Attendance";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import mongoose from "mongoose";
import Student from "@/models/Student";
import connectDB from "../db";
import { revalidatePath } from "next/cache";

/**
 * Builds the feature vector for a student.
 * Optimized with lean queries and focused projections.
 */
export async function getStudentFeaturesAction(studentId, academicYear) {
  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // 1. Fetch all required data in parallel to reduce waterfall latency
    const [attendanceRecords, midtermExam, unitExams, previousExam] =
      await Promise.all([
        Attendance.find({
          academicYear,
          type: "Student",
          "records.personId": studentObjectId,
        }).lean(),
        Exam.findOne({ examType: "Mid Term", academicYear })
          .select("_id")
          .lean(),
        Exam.find({ examType: "Unit Test", academicYear }).select("_id").lean(),
        Exam.findOne({ examType: "Final", academicYear }).select("_id").lean(),
        // Exam.findOne({ examType: "Quarterly", academicYear }).select("_id").lean(),
      ]);

    // 2. Process Attendance
    let totalDays = 0;
    let presentDays = 0;
    attendanceRecords.forEach((day) => {
      const record = day.records.find(
        (r) => r.personId.toString() === studentId,
      );
      if (record) {
        totalDays++;
        if (record.status === "Present") presentDays++;
      }
    });

    // 3. Process Results in parallel
    const [midtermResult, unitResults, previousResult] = await Promise.all([
      midtermExam
        ? Result.findOne({
            exam: midtermExam._id,
            student: studentObjectId,
          }).lean()
        : null,
      unitExams.length
        ? Result.find({
            exam: { $in: unitExams.map((e) => e._id) },
            student: studentObjectId,
          }).lean()
        : [],
      previousExam
        ? Result.findOne({
            exam: previousExam._id,
            student: studentObjectId,
          }).lean()
        : null,
    ]);

    const unitAvg = unitResults.length
      ? unitResults.reduce((sum, r) => sum + r.percentage, 0) /
        unitResults.length
      : 0;

    return {
      attendance: Number(((presentDays / (totalDays || 1)) * 100).toFixed(2)),
      midterm: Number((midtermResult?.percentage || 0).toFixed(2)),
      unit_avg: Number(unitAvg.toFixed(2)),
      previous_exam: Number((previousResult?.percentage || 0).toFixed(2)),
    };
  } catch (error) {
    console.error("Action Error [getStudentFeatures]:", error);
    throw new Error("Failed to compile student data.");
  }
}

/**
 * Calls the ML Microservice
 */
export async function predictScoreAction(features) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${process.env.ML_API_URL || "http://127.0.0.1:8000"}/predict`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("ML Service Unavailable");

    const data = await response.json();
    return data.predicted_final_exam;
  } catch (error) {
    console.error("Action Error [predictScore]:", error);
    return null;
  }
}





export async function updatePrediction(studentId, predicted) {
  await connectDB();
  await Student.findByIdAndUpdate(studentId, {
    predictedFinalExam: predicted,
    predictionDate: new Date(),
    modelVersion: "v1.0",
  });
  revalidatePath(`/students/${studentId}`);
}

