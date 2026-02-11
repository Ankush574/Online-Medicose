import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    strength: { type: String, required: true },
    form: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);

export default Medicine;
