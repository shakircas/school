import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },

    // NEW (relational)
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    // NEW (snapshot for offline + history)
    subjectName: {
      type: String,
      required: true,
    },

    // OLD (kept for migration safety)
    subject: {
      type: String,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { _id: true }
);

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sections: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true, // 👈 IMPORTANT
        },
        name: { type: String, required: true },
        capacity: { type: Number, default: 40 },
        classTeacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
      },
    ],

    academicYear: {
      type: String,
      required: true,
    },
    subjects: [
      {
        name: String,
        code: String,
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        periods: Number,
      },
    ],
    // subjects: [
    //   {
    //     name: { type: String, required: true },
    //     code: { type: String, required: true },
    //     teacher: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Teacher",
    //       required: true,
    //     },
    //     periods: {
    //       type: Number,
    //       required: true,
    //       min: 1,
    //       max: 10,
    //     },
    //   },
    // ],

    feeStructure: {
      tuitionFee: Number,
      admissionFee: Number,
      examFee: Number,
      labFee: Number,
      libraryFee: Number,
      sportsFee: Number,
      computerFee: Number,
      otherFee: Number,
    },
    // schedule: [
    //   {
    //     day: String,
    //     periods: [
    //       {
    //         time: String,
    //         subject: String,
    //         teacher: {
    //           type: mongoose.Schema.Types.ObjectId,
    //           ref: "Teacher",
    //         },
    //       },
    //     ],
    //   },
    // ],
    schedule: [
      {
        day: { type: String, required: true },
        periods: [periodSchema],
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1, academicYear: 1 });

export default mongoose.models.Class || mongoose.model("Class", classSchema);
