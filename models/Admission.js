import mongoose from "mongoose";

const AdmissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },

    rollNumber: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },

    class: { type: String, required: true },
    section: { type: String, required: true },

    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    dateOfBirth: { type: Date },
    admissionDate: { type: Date, default: Date.now },

    contactNumber: { type: String },
    address: { type: String },

    status: {
      type: String,
      enum: ["Active", "Pending", "Inactive"],
      default: "Active",
    },

    image: { type: String }, // optional
  },
  { timestamps: true }
);

export default mongoose.models.Admission ||
  mongoose.model("Admission", AdmissionSchema);
