import mongoose, { Schema, Document } from "mongoose";

export type ExpenseCategory =
  | "travel"
  | "food"
  | "accommodation"
  | "internet"
  | "stationery"
  | "other";

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    internId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: ["travel", "food", "accommodation", "internet", "stationery", "other"],
      required: true,
      default: "travel",
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    receiptNote: { type: String, default: "" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ internId: 1, date: -1 });

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
