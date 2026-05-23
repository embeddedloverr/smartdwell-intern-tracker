import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  internId: mongoose.Types.ObjectId;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  workingMinutes?: number;
  selfieBase64: string; // compressed JPEG base64
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: "present" | "half-day" | "late";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    internId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    workingMinutes: { type: Number },
    selfieBase64: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["present", "half-day", "late"],
      default: "present",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// One attendance record per intern per day
AttendanceSchema.index({ internId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);
