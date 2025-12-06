import mongoose from "mongoose"

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      enum: ["Monthly", "Quarterly", "Mid Term", "Final", "Unit Test", "Practice"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    schedule: [
      {
        subject: String,
        date: Date,
        startTime: String,
        endTime: String,
        venue: String,
        totalMarks: Number,
        passingMarks: Number,
        invigilator: String,
      },
    ],
    instructions: {
      type: String,
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

examSchema.index({ academicYear: 1, class: 1 })
examSchema.index({ status: 1 })

export default mongoose.models.Exam || mongoose.model("Exam", examSchema)
