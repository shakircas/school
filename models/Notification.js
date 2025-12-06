import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Info", "Warning", "Success", "Error", "Announcement"],
      default: "Info",
    },
    category: {
      type: String,
      enum: ["General", "Fee", "Exam", "Assignment", "Attendance", "Result", "Event"],
      default: "General",
    },
    recipients: {
      type: String,
      enum: ["All", "Students", "Teachers", "Parents", "Specific"],
      default: "All",
    },
    specificRecipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "recipientType",
      },
    ],
    recipientType: {
      type: String,
      enum: ["Student", "Teacher"],
    },
    class: String,
    section: String,
    readBy: [
      {
        user: mongoose.Schema.Types.ObjectId,
        readAt: Date,
      },
    ],
    expiresAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
)

notificationSchema.index({ recipients: 1 })
notificationSchema.index({ createdAt: -1 })

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema)
