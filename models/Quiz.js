import mongoose from "mongoose"

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    subject: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: String,
    chapter: String,
    topic: String,
    duration: {
      type: Number, // in minutes
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    questions: [
      {
        question: String,
        type: {
          type: String,
          enum: ["MCQ", "True/False", "Short Answer", "Long Answer"],
        },
        options: [String],
        correctAnswer: String,
        marks: Number,
        explanation: String,
      },
    ],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["Draft", "Published", "Active", "Completed", "Archived"],
      default: "Draft",
    },
    allowRetake: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  {
    timestamps: true,
  },
)

quizSchema.index({ class: 1, subject: 1 })
quizSchema.index({ status: 1 })

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema)
