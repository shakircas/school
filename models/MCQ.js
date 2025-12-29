import mongoose from "mongoose"

const mcqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      validate: [(v) => v.length === 4, "MCQ must have 4 options"],
      required: true,
    },

    correctAnswer: {
      type: Number, // 0–3
      min: 0,
      max: 3,
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
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // options: [
    //   {
    //     text: String,
    //     isCorrect: Boolean,
    //   },
    // ],
    // correctAnswer: {
    //   type: String,
    //   required: true,
    // },
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
    language: {
      type: String,
      enum: ["English", "Urdu"],
      default: "English",
    },
  },
  {
    timestamps: true,
  }
);

mcqSchema.index({ subject: 1, class: 1, chapter: 1 })
mcqSchema.index({ difficulty: 1 })
mcqSchema.index({ question: "text" })

export default mongoose.models.MCQ || mongoose.model("MCQ", mcqSchema)
