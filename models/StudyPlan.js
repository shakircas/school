import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    durationDays: Number,
    tasks: [
      {
        day: Number,
        subject: String,
        topic: String,
        taskDescription: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.StudyPlan ||
  mongoose.model("StudyPlan", studyPlanSchema);
