import mongoose, { Schema, Document } from "mongoose";

export interface IDeclaredProperty extends Document {
  clerkId: string;
  userNIC: string;
  fullName: string;
  address: string;
  phone: string;
  status: "pending" | "assessed";
  assessedPropertyId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DeclaredPropertySchema: Schema = new Schema({
  clerkId: { type: String, required: true },
  userNIC: { type: String, required: true },
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["pending", "assessed"], default: "pending" },
  assessedPropertyId: { type: Schema.Types.ObjectId, ref: "Property" },
  createdAt: { type: Date, default: Date.now },
});

export const DeclaredProperty =
  mongoose.models.DeclaredProperty ||
  mongoose.model<IDeclaredProperty>("DeclaredProperty", DeclaredPropertySchema);
