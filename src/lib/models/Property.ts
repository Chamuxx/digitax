import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  location: {
    lat: number;
    lng: number;
  };
  area: number;
  geometry: { x: number; y: number }[];
  attributes: {
    flooring: string;
    floors: number;
    hasPool: boolean;
    hasGarage: boolean;
    gardenSize: string; // e.g., 'none', 'small', 'medium', 'large'
    usage: string; // 'residential' or 'commercial'
    yearBuilt?: number;
  };
  taxAmount: number;
  assignedUserEmail: string;
  assignedUserNIC: string;
  createdAt: Date;
}

const PropertySchema: Schema = new Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  area: { type: Number, required: true },
  geometry: [
    {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  ],
  attributes: {
    flooring: { type: String, required: true, default: "cement" },
    floors: { type: Number, required: true, default: 1 },
    hasPool: { type: Boolean, required: true, default: false },
    hasGarage: { type: Boolean, required: true, default: false },
    gardenSize: { type: String, required: true, default: "none" },
    usage: { type: String, required: true, default: "residential" },
    yearBuilt: { type: Number },
  },
  taxAmount: { type: Number, required: true },
  assignedUserEmail: { type: String, required: true },
  assignedUserNIC: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Property =
  mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
