import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examName: String,
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: String,
    rollNumber: String,
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: {
      type: String,
      required: true,
      index: true,
    },
    academicYear: String,
    subjects: [
      {
        subject: String,
        totalMarks: Number,
        obtainedMarks: Number,
        percentage: Number,
        grade: String,
        remarks: String,
        examiner: String,
      },
    ],
    totalMarks: Number,
    obtainedMarks: Number,
    percentage: Number,
    grade: String,
    rank: Number,
    status: {
      type: String,
      enum: ["Pass", "Fail", "Pending"],
      default: "Pending",
    },
    remarks: String,
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ exam: 1, student: 1 });
resultSchema.index({ classId: 1, academicYear: 1 });

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
