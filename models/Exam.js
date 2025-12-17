
import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    examType: {
      type: String,
      enum: [
        "Monthly",
        "Quarterly",
        "Mid Term",
        "Final",
        "Unit Test",
        "Practice",
      ],
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    // ✅ SAME AS STUDENT
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    // ✅ SAME AS STUDENT (string section _id)
    sectionId: {
      type: String,
      required: true,
      index: true,
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
        invigilator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
      },
    ],

    instructions: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  { timestamps: true }
);

// ✅ indexes aligned with queries
examSchema.index({ academicYear: 1, classId: 1, sectionId: 1 });
examSchema.index({ status: 1 });

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
