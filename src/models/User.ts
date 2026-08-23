import mongoose, { Schema, type Model } from "mongoose";
import { USER_ROLES, type UserRole } from "@/types";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  image?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    image: { type: String },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "CUSTOMER",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    emailVerified: { type: Date },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, createdAt: -1 });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
