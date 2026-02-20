import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Result from "@/models/Result";
import RiskProfile from "@/models/RiskProfile";
import { calculateRisk } from "@/lib/riskCalculator";

export async function POST(req) {
  try {
    await connectDB();
    const { classId, sectionId, academicYear } = await req.json();

    // 1. Fetch Students
    const students = await Student.find({ classId, status: "Active" });
    if (!students.length)
      return NextResponse.json({ message: "No students found", students: [] });

    // 2. Fetch Supporting Data
    const attendanceDocs = await Attendance.find({
      classId,
    //   sectionId,
      academicYear,
    });
    // Important: Get all results to calculate trend over time
    const results = await Result.find({
      classId,
    //   sectionId,
    //   academicYear,
    //   published: true,
    }).sort({ createdAt: 1 });

    const bulkOps = [];

    for (const student of students) {
      // --- A. ATTENDANCE CALCULATION ---
      let totalDays = 0;
      let presentDays = 0;

      attendanceDocs.forEach((day) => {
        const record = day.records.find(
          (r) => r.personId.toString() === student._id.toString(),
        );
        if (record) {
          totalDays++;
          if (record.status === "Present") presentDays++;
        }
      });
      const attendancePercentage =
        totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      // --- B. ACADEMIC & SUBJECT EXTRACTION ---
      const studentResults = results.filter(
        (r) => r.student.toString() === student._id.toString(),
      );

      let academicAverage = 0;
      let trendScore = 50; // Neutral default
      let subjectBreakdown = [];

      if (studentResults.length > 0) {
        // Calculate Overall Average
        academicAverage =
          studentResults.reduce((acc, r) => acc + r.percentage, 0) /
          studentResults.length;

        // Calculate Trend (Compare last exam to average of previous exams)
        if (studentResults.length >= 2) {
          const lastResult =
            studentResults[studentResults.length - 1].percentage;
          const previousResults = studentResults.slice(0, -1);
          const prevAvg =
            previousResults.reduce((acc, r) => acc + r.percentage, 0) /
            previousResults.length;

          const diff = lastResult - prevAvg;
          if (diff > 5)
            trendScore = 100; // Improving
          else if (diff < -5)
            trendScore = 20; // Dropping significantly
          else trendScore = 60; // Stable
        }

        // --- SUBJECT EXTRACTION LOGIC ---
        const subjectMap = {};
        studentResults.forEach((res) => {
          res.subjects.forEach((sub) => {
            if (!subjectMap[sub.subject]) subjectMap[sub.subject] = [];
            const percent = (sub.obtainedMarks / sub.totalMarks) * 100;
            subjectMap[sub.subject].push(percent);
          });
        });

        subjectBreakdown = Object.keys(subjectMap).map((subjectName) => ({
          subject: subjectName,
          average:
            subjectMap[subjectName].reduce((a, b) => a + b, 0) /
            subjectMap[subjectName].length,
        }));
      }

      // --- C. FINAL RISK CALCULATION ---
      // This uses your custom logic (weighted avg of attendance, academic, and trend)
      const { score, level } = calculateRisk({
        attendance: attendancePercentage,
        academic: academicAverage,
        trend: trendScore,
      });

      bulkOps.push({
        updateOne: {
          filter: { student: student._id },
          update: {
            student: student._id,
            classId,
            sectionId,
            academicYear,
            attendanceScore: attendancePercentage,
            academicScore: academicAverage,
            trendScore: trendScore,
            subjectBreakdown,
            finalRiskScore: score,
            riskLevel: level,
            lastCalculated: new Date(),
          },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) await RiskProfile.bulkWrite(bulkOps);

    // --- D. AGGREGATE DATA FOR FRONTEND ---
    const updatedProfiles = await RiskProfile.find({ classId }).populate(
      "student",
      "name",
    );

    // 1. Student Heatmap Data
    const studentsData = updatedProfiles.map((p) => ({
      _id: p.student._id,
      name: p.student.name,
      riskScore: p.finalRiskScore,
      riskLevel: p.riskLevel,
      subjectBreakdown: p.subjectBreakdown, // Required for subject-specific filtering
    }));

    // 2. Subject Heatmap Data
    const subjectStats = {};
    updatedProfiles.forEach((profile) => {
      profile.subjectBreakdown.forEach((sub) => {
        if (!subjectStats[sub.subject]) {
          subjectStats[sub.subject] = {
            name: sub.subject,
            totalRisk: 0,
            count: 0,
            atRisk: 0,
          };
        }
        const risk = 100 - sub.average;
        subjectStats[sub.subject].totalRisk += risk;
        subjectStats[sub.subject].count++;
        if (sub.average < 40) subjectStats[sub.subject].atRisk++;
      });
    });

    const subjectSummary = Object.values(subjectStats).map((s) => ({
      subjectId: s.name,
      subjectName: s.name,
      averageRisk: Math.round(s.totalRisk / s.count),
      atRiskCount: s.atRisk,
    }));

    // 3. Pie Chart Data
    const pieData = [
      {
        name: "Stable",
        value: updatedProfiles.filter((p) => p.riskLevel === "Low").length,
      },
      {
        name: "Warning",
        value: updatedProfiles.filter((p) => p.riskLevel === "Medium").length,
      },
      {
        name: "Critical",
        value: updatedProfiles.filter((p) => p.riskLevel === "High").length,
      },
    ];

    // 4. Trend Chart Data
    const examStats = {};
    results.forEach((res) => {
      const examName = res.exam?.name || "Term Exam"; // Fallback name
      if (!examStats[examName]) examStats[examName] = { total: 0, count: 0 };
      examStats[examName].total += 100 - res.percentage;
      examStats[examName].count++;
    });

    const trendData = Object.keys(examStats).map((exam) => ({
      exam,
      averageRisk: Math.round(examStats[exam].total / examStats[exam].count),
    }));

    console.log(subjectSummary);

    return NextResponse.json({
      students: studentsData,
      subjectSummary,
      pieData,
      trendData,
    });
  } catch (error) {
    console.error("Calculation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
