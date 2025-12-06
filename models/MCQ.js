import mongoose from "mongoose"

const mcqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    chapter: String,
    topic: String,
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: String,
    marks: {
      type: Number,
      default: 1,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    usedInQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    statistics: {
      timesUsed: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      wrongAttempts: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

mcqSchema.index({ subject: 1, class: 1, chapter: 1 })
mcqSchema.index({ difficulty: 1 })
mcqSchema.index({ question: "text" })

export default mongoose.models.MCQ || mongoose.model("MCQ", mcqSchema)
