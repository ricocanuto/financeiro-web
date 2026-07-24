import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    color: { type: String, default: "#0ACF83" },
    monthlyGoal: { type: Number, default: null }, // usado nas "Metas de despesas"
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
