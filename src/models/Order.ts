import mongoose, { Schema, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/types";

export interface IOrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IOrderShipping {
  county: string;
  town: string;
  address: string;
  instructions?: string;
}

export interface IOrderTimelineEvent {
  status: OrderStatus;
  at: Date;
  note?: string;
}

export interface IOrder {
  orderNumber: string;
  user?: Types.ObjectId;
  customer: IOrderCustomer;
  shipping: IOrderShipping;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payment?: Types.ObjectId;
  notes?: string;
  internalNotes?: string;
  timeline: IOrderTimelineEvent[];
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, index: true },
      phone: { type: String, required: true },
    },
    shipping: {
      county: { type: String, required: true },
      town: { type: String, required: true },
      address: { type: String, required: true },
      instructions: String,
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, uppercase: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    notes: String,
    internalNotes: String,
    timeline: [
      {
        status: { type: String, enum: ORDER_STATUSES, required: true },
        at: { type: Date, required: true },
        note: String,
      },
    ],
    estimatedDelivery: Date,
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);
