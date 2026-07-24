import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // vem do Supabase (auth.uid())
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "wallet" },
    color: { type: String, default: "#00C896" },
    initialBalance: { type: Number, default: 0 },
    includeInTotal: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
