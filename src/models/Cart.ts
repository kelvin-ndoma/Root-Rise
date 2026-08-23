import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICart {
  user?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
  },
  { timestamps: true },
);

export const Cart: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>("Cart", CartSchema);
