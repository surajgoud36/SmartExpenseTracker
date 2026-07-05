import mongoose from "mongoose";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Other"];

const expenseSchema = new mongoose.Schema(
  {
    // userId added in Phase 5 when auth lands
    amount: { type: Number, required: true, min: 1 }, // stored as paise (integer)
    category: { type: String, enum: CATEGORIES, default: "Other" },
    description: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true } // auto createdAt / updatedAt
);

expenseSchema.index({ date: -1 }); // becomes { userId: 1, date: -1 } in Phase 5

export const Expense = mongoose.model("Expense", expenseSchema);
export { CATEGORIES };