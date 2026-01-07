import mongoose from "mongoose";
const feeSchema = new mongoose.Schema(
  {
    // 🔗 Core relations
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

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
    //   required: true,
    // },

    // 🧾 Snapshot fields (VERY IMPORTANT)
    studentName: String,
    rollNumber: String,
    className: String,
    sectionName: String,

    academicYear: {
      type: String,
      required: true,
    },

    month: {
      type: String,
      required: true,
      default: "all",
    },

    // 💰 Fee breakdown
    feeStructure: {
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

    // store version info

    feeStructureMeta: {
      structureId: mongoose.Schema.Types.ObjectId,
      version: Number,
      effectiveFromMonth: String,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    discount: { type: Number, default: 0 },
    discountReason: String,

    fine: { type: Number, default: 0 },
    fineReason: String,

    netAmount: {
      type: Number,
      required: true,
    },

    paidAmount: { type: Number, default: 0 },

    dueAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Partial", "Paid", "Overdue"],
      default: "Pending",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    payments: [
      {
        amount: Number,
        paymentDate: Date,
        paymentMethod: {
          type: String,
          enum: ["Cash", "Card", "Bank Transfer", "Cheque", "Online"],
        },
        receiptNumber: String,
        collectedBy: String,
        remarks: String,
      },
    ],

    invoiceNumber: {
      type: String,
      unique: true,
    },

    // models/Fee.js
    installments: [
      {
        label: String,
        amount: Number,
        dueDate: Date,
        paidAmount: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["Pending", "Paid", "Partial"],
          default: "Pending",
        },
        locked: { type: Boolean, default: false },
        fine: { type: Number, default: 0 },
      },
    ],

    scholarship: {
      type: Number, // amount
      default: 0,
    },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, academicYear: 1, month: 1 }, { unique: true });
feeSchema.index({ classId: 1, sectionId: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });
export default mongoose.models.Fee || mongoose.model("Fee", feeSchema);
