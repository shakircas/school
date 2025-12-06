import mongoose from "mongoose"

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },
    qualification: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: String,
      },
    ],
    assignedClasses: [
      {
        class: String,
        section: String,
        subject: String,
      },
    ],
    salary: {
      basic: Number,
      allowances: Number,
      deductions: Number,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Resigned", "Terminated"],
      default: "Active",
    },
    photo: {
      url: String,
      publicId: String,
    },
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
)

teacherSchema.index({ name: "text", employeeId: "text", email: "text" })
teacherSchema.index({ department: 1 })
teacherSchema.index({ status: 1 })

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema)
