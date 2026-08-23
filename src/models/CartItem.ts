import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICartItem {
  cart: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    cart: { type: Schema.Types.ObjectId, ref: "Cart", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

CartItemSchema.index({ cart: 1, product: 1, variant: 1 }, { unique: true });

export const CartItem: Model<ICartItem> =
  mongoose.models.CartItem ?? mongoose.model<ICartItem>("CartItem", CartItemSchema);
