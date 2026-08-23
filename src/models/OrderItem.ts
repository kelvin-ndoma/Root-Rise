import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IOrderItem {
  order: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  image?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: String,
    variantLabel: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const OrderItem: Model<IOrderItem> =
  mongoose.models.OrderItem ?? mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
