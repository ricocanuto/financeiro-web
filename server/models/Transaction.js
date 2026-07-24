import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    type: { type: String, enum: ["income", "expense"], required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true }, // sempre positivo, o "type" define o sinal
    date: { type: Date, required: true },
    confirmed: { type: Boolean, default: false }, // false = projetado, true = confirmado
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: 1 });

export default mongoose.model("Transaction", transactionSchema);
