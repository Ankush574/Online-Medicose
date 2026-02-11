import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    userEmail: { type: String },
    doctorName: { type: String, required: true },
    datetime: { type: Date, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;
