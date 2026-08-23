import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IAddress {
  user: Types.ObjectId;
  fullName: string;
  phone: string;
  county: string;
  town: string;
  address: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    county: { type: String, required: true },
    town: { type: String, required: true },
    address: { type: String, required: true },
    instructions: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AddressSchema.index({ user: 1, isDefault: 1 });

export const Address: Model<IAddress> =
  mongoose.models.Address ?? mongoose.model<IAddress>("Address", AddressSchema);
