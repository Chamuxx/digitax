import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  nic?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  nic: { type: String, unique: true, sparse: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, required: true, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
