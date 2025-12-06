import mongoose from "mongoose"

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: String,
    rollNumber: String,
    answers: [
      {
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        marksObtained: Number,
      },
    ],
    totalMarks: Number,
    obtainedMarks: Number,
    percentage: Number,
    grade: String,
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Timed Out"],
      default: "In Progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    timeTaken: Number, // in seconds
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

quizAttemptSchema.index({ quiz: 1, student: 1 })

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema)
