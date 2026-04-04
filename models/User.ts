import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "mentor" | "intern";
  phase: 1 | 2 | 3 | 4;
  joinDate: Date;
  avatarInitials: string;
  active: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["mentor", "intern"], required: true },
  phase: { type: Number, enum: [1, 2, 3, 4], default: 1 },
  joinDate: { type: Date, default: Date.now },
  avatarInitials: { type: String },
  active: { type: Boolean, default: true },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
