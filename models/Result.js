// import mongoose from "mongoose";

// const resultSchema = new mongoose.Schema(
//   {
//     exam: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Exam",
//       required: true,
//     },
//     examName: String,
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: true,
//     },
//     studentName: String,
//     rollNumber: String,
//     classId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Class",
//       required: true,
//       index: true,
//       default: 'all',
//     },
//     sectionId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     academicYear: String,
//     subjects: [
//       {
//         subject: String,
//         totalMarks: Number,
//         obtainedMarks: Number,
//         percentage: Number,
//         grade: String,
//         remarks: String,
//         examiner: String,
//       },
//     ],
//     totalMarks: Number,
//     obtainedMarks: Number,
//     percentage: Number,
//     grade: String,
//     rank: Number,
//     status: {
//       type: String,
//       enum: ["Pass", "Fail", "Pending"],
//       default: "Pending",
//     },
//     remarks: String,
//     publishedAt: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// resultSchema.index({ exam: 1, student: 1 });
// resultSchema.index({ classId: 1, academicYear: 1 });

// export default mongoose.models.Result || mongoose.model("Result", resultSchema);
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: {
      type: String, // Changed to ObjectId for integrity
      index: true,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },

    // Detailed subject-wise breakdown
    subjects: [
      {
        subject: { type: String, required: true },
        totalMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true, default: 0 },
        passingMarks: { type: Number, default: 0 },
        isAbsent: { type: Boolean, default: false },
        grade: String,
        remarks: String,
      },
    ],

    // Automated Summary Fields
    totalMaxMarks: { type: Number, default: 0 },
    totalObtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    gpa: { type: Number, default: 0 }, // For schools using 4.0/5.0 scales

    status: {
      type: String,
      enum: ["Pass", "Fail", "Pending", "Held"],
      default: "Pending",
    },

    attendancePercentage: { type: Number, min: 0, max: 100 },
    rank: { type: Number }, // Calculated via post-save scripts or aggregation
    teacherRemarks: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true },
);

// --- INDEXES ---
// Prevent duplicate result entries for the same student in the same exam
resultSchema.index({ exam: 1, student: 1 }, { unique: true });
resultSchema.index({ classId: 1, sectionId: 1, academicYear: 1 });

// --- MIDDLEWARE: Automated Calculations ---
resultSchema.pre("save", function (next) {
  if (this.subjects && this.subjects.length > 0) {
    let totalObtained = 0;
    let totalMax = 0;
    let hasFailedAnySubject = false;

    this.subjects.forEach((sub) => {
      totalObtained += sub.obtainedMarks;
      totalMax += sub.totalMarks;

      // Basic Pass/Fail Logic per subject
      if (sub.obtainedMarks < sub.passingMarks) {
        hasFailedAnySubject = true;
      }
    });

    this.totalObtainedMarks = totalObtained;
    this.totalMaxMarks = totalMax;

    if (totalMax > 0) {
      this.percentage = parseFloat(
        ((totalObtained / totalMax) * 100).toFixed(2),
      );
    }

    // Auto-update status based on marks if not manually set to Held/Pending
    if (this.status !== "Held") {
      this.status = hasFailedAnySubject ? "Fail" : "Pass";
    }
  }
});

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
