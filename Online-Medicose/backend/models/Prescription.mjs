import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    userEmail: { type: String },
    medicineName: { type: String, required: true },
    strength: { type: String },
    dosage: { type: String },
    duration: { type: String },
    prescribedDate: { type: String },
    expiryDate: { type: String },
    doctor: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: [
        "Active",      // general active script
        "Pending",     // awaiting doctor or pharmacist approval
        "Approved",    // clinically approved, not yet filled
        "Filled",      // filled by pharmacy
        "Dispensed",   // handed over / shipped
        "Rejected",    // explicitly declined
        "Expired",     // past validity
        "Cancelled",   // cancelled by patient/doctor
        "Completed",   // course finished successfully
        "Draft",       // being composed in doctor workspace
        "Signed"       // digitally signed but not yet sent
      ],
      default: "Active",
    },
    refillCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Prescription =
  mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
