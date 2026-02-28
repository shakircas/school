import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StudyPlan from "@/models/StudyPlan";
import TopicPerformance from "@/models/TopicPerformance";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId"); // Filter by class if provided

    // 1. Build Query
    let query = {};
    // If you have a Student model with classId, you'd filter via population or a sub-query
    // For now, we fetch all and ensure student details are populated
    const plans = await StudyPlan.find(query)
      .populate("student", "name rollNumber className")
      .sort({ updatedAt: -1 });

    const analytics = await Promise.all(
      plans.map(async (plan) => {
        // Use the same logic as the frontend: prioritize aiPlan if it exists
        const planData = plan.aiPlan || plan;
        const tasks = planData.tasks || [];

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.completed).length;
        const masteryPercent =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 2. Fetch specific weak areas from TopicPerformance
        // This gives teachers a 'Risk Level' based on actual test scores
        const weakTopicsCount = await TopicPerformance.countDocuments({
          student: plan.student._id,
          masteryLevel: { $lt: 50 }, // Critical threshold
        });

        // 3. Group by Subject for teacher breakdown
        const subjectBreakdown = tasks.reduce((acc, t) => {
          if (!acc[t.subject]) acc[t.subject] = { total: 0, done: 0 };
          acc[t.subject].total++;
          if (t.completed) acc[t.subject].done++;
          return acc;
        }, {});

        return {
          studentId: plan.student._id,
          studentName: plan.student.name,
          rollNumber: plan.student.rollNumber,
          className: plan.student.className,
          progress: masteryPercent,
          completedCount: completedTasks,
          totalCount: totalTasks,
          weakTopics: weakTopicsCount,
          lastActivity: plan.updatedAt,
          subjectStatus: subjectBreakdown,
          status:
            masteryPercent === 100
              ? "Ready"
              : isAtRisk(masteryPercent, weakTopicsCount),
        };
      }),
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Teacher Analytics Error:", error);
    return NextResponse.json(
      { error: "Analytics sync failed" },
      { status: 500 },
    );
  }
}

// Helper for teacher-side risk assessment
function isAtRisk(progress, weakCount) {
  if (progress < 20 && weakCount > 5) return "High Risk";
  if (progress < 50) return "In Progress";
  return "Stable";
}
