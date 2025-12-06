import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    registrationNumber: {
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
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
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
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },
    fatherName: {
      type: String,
      required: true,
    },
    fatherPhone: {
      type: String,
    },
    fatherOccupation: {
      type: String,
    },
    motherName: {
      type: String,
    },
    motherPhone: {
      type: String,
    },
    guardianName: {
      type: String,
    },
    guardianPhone: {
      type: String,
    },
    guardianRelation: {
      type: String,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    admissionClass: {
      type: String,
    },
    previousSchool: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated", "Transferred", "Expelled"],
      default: "Active",
    },
    withdrawalDate: {
      type: Date,
    },
    withdrawalReason: {
      type: String,
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
    medicalInfo: {
      allergies: String,
      conditions: String,
      medications: String,
    },
    transportRoute: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

studentSchema.index({ name: "text", rollNumber: "text", registrationNumber: "text" })
studentSchema.index({ class: 1, section: 1 })
studentSchema.index({ status: 1 })

export default mongoose.models.Student || mongoose.model("Student", studentSchema)
