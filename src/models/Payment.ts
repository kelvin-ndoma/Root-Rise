import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/types";

export type PaymentProviderId = "manual" | "mpesa" | "card";

export interface IPayment {
  order: Types.ObjectId;
  provider: PaymentProviderId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerReference?: string;
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: {
      type: String,
      enum: ["manual", "mpesa", "card"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "KES" },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    providerReference: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    paidAt: Date,
  },
  { timestamps: true },
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);
