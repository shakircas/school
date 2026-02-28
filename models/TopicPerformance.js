import mongoose from "mongoose";

const topicPerformanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    score: {
      type: Number, // percentage
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    masteryLevel: {
      type: Number, // 0–100
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.TopicPerformance ||
  mongoose.model("TopicPerformance", topicPerformanceSchema);
