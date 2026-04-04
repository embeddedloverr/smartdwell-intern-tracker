import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  phase: 1 | 2 | 3 | 4;
  week: number;
  weekTitle: string;
  taskNumber: number;
  title: string;
  description: string;
  selfCheck: string;
}

const TaskSchema = new Schema<ITask>({
  phase: { type: Number, required: true, enum: [1, 2, 3, 4] },
  week: { type: Number, required: true, min: 1, max: 16 },
  weekTitle: { type: String, required: true },
  taskNumber: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  selfCheck: { type: String, required: true },
});

TaskSchema.index({ phase: 1, week: 1, taskNumber: 1 }, { unique: true });

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
