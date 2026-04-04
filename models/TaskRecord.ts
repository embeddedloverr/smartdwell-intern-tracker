import mongoose, { Schema, Document } from "mongoose";

export interface ITaskRecord extends Document {
  _id: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  status: "pending" | "in_progress" | "done" | "needs_retry";
  mentorInitials: string;
  notes: string;
  mentorFeedback: string;
  completedAt: Date | null;
  updatedAt: Date;
}

const TaskRecordSchema = new Schema<ITaskRecord>(
  {
    internId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done", "needs_retry"],
      default: "pending",
    },
    mentorInitials: { type: String, default: "" },
    notes: { type: String, default: "" },
    mentorFeedback: { type: String, default: "" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskRecordSchema.index({ internId: 1, taskId: 1 }, { unique: true });

export default mongoose.models.TaskRecord ||
  mongoose.model<ITaskRecord>("TaskRecord", TaskRecordSchema);
