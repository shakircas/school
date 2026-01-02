import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    sectionId: {
      type: String,
      required: true,
      index: true,
      default: "all",
    },

    // sectionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null, // null = applies to all sections
    // },

    academicYear: {
      type: String,
      required: true,
    },

    // 🏷 Snapshot (VERY IMPORTANT)
    className: String,
    sectionName: String,

    // 💰 Fee definition
    fees: {
      tuitionFee: { type: Number, default: 0 },
      admissionFee: { type: Number, default: 0 },
      examFee: { type: Number, default: 0 },
      labFee: { type: Number, default: 0 },
      libraryFee: { type: Number, default: 0 },
      sportsFee: { type: Number, default: 0 },
      transportFee: { type: Number, default: 0 },
      computerFee: { type: Number, default: 0 },
      otherFee: { type: Number, default: 0 },
    },

    // 📅 Rules
    applicableMonths: {
      type: [String], // ["Jan", "Feb", ...]
      default: [],
    },

    isMonthly: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    remarks: String,
  },
  { timestamps: true }
);

// 🧠 Index rules
feeStructureSchema.index(
  { classId: 1, sectionId: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.models.FeeStructure ||
  mongoose.model("FeeStructure", feeStructureSchema);
