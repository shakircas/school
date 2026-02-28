
import { NextResponse } from "next/server";
import {
  generateAIAdaptivePlan,
  generateBasicStudyPlan,
} from "@/lib/adaptiveEngine";
import StudyPlan from "@/models/StudyPlan";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, taskId, isCompleted, action } = body;

    // --- CASE 1: RESET PLAN ---
    if (action === "RESET" && studentId) {
      await StudyPlan.deleteMany({ student: studentId });
      return NextResponse.json({ success: true, message: "Progress cleared." });
    }

    // --- CASE 2: UPDATE TASK COMPLETION ---
    if (taskId) {
      const updatedPlan = await StudyPlan.findOneAndUpdate(
        { "tasks._id": taskId },
        { $set: { "tasks.$.completed": isCompleted } },
        { new: true },
      );
      return NextResponse.json({ success: true, plan: updatedPlan });
    }

    // --- CASE 3: INITIAL PLAN GENERATION ---
    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID required" },
        { status: 400 },
      );
    }

    const [plan, aiPlan] = await Promise.all([
      generateBasicStudyPlan(studentId),
      generateAIAdaptivePlan(studentId),
    ]);

    return NextResponse.json({ plan, aiPlan });
  } catch (error) {
    console.error("Adaptive Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// Add this to your route.js
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const plan = await StudyPlan.findOne({ student: studentId }).sort({ createdAt: -1 });

    if (!plan) return NextResponse.json({ message: "No plan found" });

    // Return the plan in a structure the frontend expects
    return NextResponse.json({ aiPlan: plan }); 
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}