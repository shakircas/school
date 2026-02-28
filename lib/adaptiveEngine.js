import TopicPerformance from "@/models/TopicPerformance";

import StudyPlan from "@/models/StudyPlan";
import connectDB from "./db";
import Student from "@/models/Student";
import { generateAIStudyPlan } from "./geminiAdaptive";

export async function calculateWeakTopics(studentId) {
  await connectDB();

  const topics = await TopicPerformance.find({ student: studentId });

  const weakTopics = topics.filter((t) => t.masteryLevel < 40);

  return weakTopics.map((t) => ({
    subject: t.subject,
    chapter: t.chapter,
    topic: t.topic,
    masteryLevel: t.masteryLevel,
  }));
}

export async function generateBasicStudyPlan(studentId) {
  const weakTopics = await calculateWeakTopics(studentId);

  if (weakTopics.length === 0) {
    return null;
  }

  const tasks = weakTopics.slice(0, 7).map((topic, index) => ({
    day: index + 1,
    subject: topic.subject,
    topic: topic.topic,
    taskDescription: `Revise ${topic.topic} from ${topic.chapter} and solve 10 practice questions.`,
  }));

  const plan = await StudyPlan.create({
    student: studentId,
    durationDays: 7,
    tasks,
  });

  return plan;
}

export async function generateAIAdaptivePlan(studentId) {
  const student = await Student.findById(studentId);

  const weakTopics = await calculateWeakTopics(studentId);

  if (!weakTopics.length) return null;

  const aiResponse = await generateAIStudyPlan(student.name, weakTopics);

  if (!aiResponse) return null;

  const tasks = aiResponse.days.map((d) => ({
    day: d.day,
    subject: d.subject,
    topic: d.topic,
    taskDescription: d.taskDescription,
  }));

  const AiPlan = await StudyPlan.create({
    student: studentId,
    durationDays: 7,
    tasks,
  });

  return AiPlan;
}
