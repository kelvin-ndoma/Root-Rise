import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  INVENTORY_TRANSACTION_TYPES,
  type InventoryTransactionType,
} from "@/types";

export interface IInventoryTransaction {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;
  balanceAfter?: number;
  order?: Types.ObjectId;
  note?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", index: true },
    type: { type: String, enum: INVENTORY_TRANSACTION_TYPES, required: true },
    quantity: { type: Number, required: true },
    balanceAfter: Number,
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    note: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

InventoryTransactionSchema.index({ product: 1, createdAt: -1 });
InventoryTransactionSchema.index({ order: 1 });

export const InventoryTransaction: Model<IInventoryTransaction> =
  mongoose.models.InventoryTransaction ??
  mongoose.model<IInventoryTransaction>(
    "InventoryTransaction",
    InventoryTransactionSchema,
  );
