import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selected: String,
        correct: Boolean,
      },
    ],
    score: Number,
    total: Number,

    startedAt: Date,
    submittedAt: Date,

    // Anti-cheat
    tabSwitches: { type: Number, default: 0 },
    copyAttempts: { type: Number, default: 0 },
    fullscreenExit: { type: Number, default: 0 },
    timeTaken: Number, // seconds
  },
  { timestamps: true }
);

export default mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", QuizAttemptSchema);
