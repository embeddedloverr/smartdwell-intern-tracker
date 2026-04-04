import mongoose, { Schema, Document } from "mongoose";

export interface IDailyLog extends Document {
  _id: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  date: Date;
  morningTopic: string;
  morningResource: string;
  morningConcept: string;
  morningRevisit: string;
  labTask: string;
  labComponents: string;
  labSteps: string;
  labResult: string;
  labError: string;
  labResolution: string;
  mentorTask: string;
  mentorTaskStatus: "pending" | "done" | "needs_retry";
  reflection: string;
  gaps: string;
  question: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  mentorComment: string;
  createdAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    internId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    morningTopic: { type: String, default: "" },
    morningResource: { type: String, default: "" },
    morningConcept: { type: String, default: "" },
    morningRevisit: { type: String, default: "" },
    labTask: { type: String, default: "" },
    labComponents: { type: String, default: "" },
    labSteps: { type: String, default: "" },
    labResult: { type: String, default: "" },
    labError: { type: String, default: "" },
    labResolution: { type: String, default: "" },
    mentorTask: { type: String, default: "" },
    mentorTaskStatus: {
      type: String,
      enum: ["pending", "done", "needs_retry"],
      default: "pending",
    },
    reflection: { type: String, default: "" },
    gaps: { type: String, default: "" },
    question: { type: String, default: "" },
    confidenceScore: { type: Number, min: 1, max: 5, default: 3 },
    mentorComment: { type: String, default: "" },
  },
  { timestamps: true }
);

DailyLogSchema.index({ internId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyLog ||
  mongoose.model<IDailyLog>("DailyLog", DailyLogSchema);
