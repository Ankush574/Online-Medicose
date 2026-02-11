import mongoose from "mongoose";

const refillRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    userEmail: { type: String },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: false },
    medicineName: { type: String, required: true },
    quantity: { type: Number },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RefillRequest =
  mongoose.models.RefillRequest || mongoose.model("RefillRequest", refillRequestSchema);

export default RefillRequest;
