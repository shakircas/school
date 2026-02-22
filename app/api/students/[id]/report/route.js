import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RiskProfile from "@/models/RiskProfile";
import Student from "@/models/Student";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const profile = await RiskProfile.findOne({ student: id }).populate(
      "student",
    );

    if (!profile) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const generateAnalysis = (p) => {
      const insights = [];
      const recommendations = [];

      // 1. Attendance Logic
      if (p.attendanceScore < 80) {
        insights.push(
          `Critical: Attendance is at ${Math.round(p.attendanceScore)}%. Absenteeism is the primary risk driver.`,
        );
        recommendations.push(
          "Mandatory parental counseling regarding attendance.",
        );
      } else if (p.attendanceScore > 95) {
        insights.push(
          "Attendance is excellent, suggesting the student is physically present but perhaps academically disengaged.",
        );
      }

      // 2. Academic Logic (Fixing the 0% issue)
      if (p.academicScore === 0) {
        insights.push(
          "No academic records found for the current period. Risk score is based solely on behavioral/attendance metrics.",
        );
        recommendations.push(
          "Conduct a baseline assessment to establish academic standing.",
        );
      } else if (p.academicScore < 50) {
        insights.push(
          `Academic performance (${Math.round(p.academicScore)}%) is below the passing threshold.`,
        );
        recommendations.push("Assign to after-school tutoring sessions.");
      }

      // 3. Trend Logic (Aligned with your 20/60/100 scale)
      if (p.trendScore <= 40) {
        insights.push(
          "Risk Alert: Academic momentum is declining rapidly compared to previous assessments.",
        );
        recommendations.push(
          "Immediate one-on-one intervention with the subject teacher.",
        );
      } else if (p.trendScore === 100) {
        insights.push(
          "Positive Growth: The student is showing significant improvement in recent tests.",
        );
      }

      // 4. Subject Specific
      const failingSubjects = p.subjectBreakdown.filter((s) => s.average < 40);
      if (failingSubjects.length > 0) {
        insights.push(
          `Specific failure risks identified in: ${failingSubjects.map((s) => s.subject).join(", ")}.`,
        );
        recommendations.push(
          `Intensive focus required on ${failingSubjects[0].subject}.`,
        );
      }

      // 5. Risk Level Catch-all
      if (p.riskLevel === "High") {
        recommendations.push(
          "Flag for Individual Education Plan (IEP) review.",
        );
      }

      return { insights, recommendations };
    };

    const analysis = generateAnalysis(profile);

    return NextResponse.json({
      profile,
      aiInsights: analysis.insights,
      recommendations: analysis.recommendations,
      generatedAt: profile.lastCalculated || new Date(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
