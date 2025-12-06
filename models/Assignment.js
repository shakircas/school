import mongoose from "mongoose"

const assignmentSchema = new mongoose.Schema(
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
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    instructions: String,
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published", "Closed", "Graded"],
      default: "Draft",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        studentName: String,
        rollNumber: String,
        submittedAt: Date,
        attachments: [
          {
            name: String,
            url: String,
            type: String,
          },
        ],
        content: String,
        marks: Number,
        grade: String,
        feedback: String,
        gradedAt: Date,
        gradedBy: String,
        status: {
          type: String,
          enum: ["Submitted", "Late", "Graded", "Returned"],
          default: "Submitted",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

assignmentSchema.index({ class: 1, subject: 1 })
assignmentSchema.index({ dueDate: 1 })
assignmentSchema.index({ status: 1 })

export default mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)
