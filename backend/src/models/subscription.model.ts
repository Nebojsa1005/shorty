import { Schema, model, Document } from "mongoose";

export interface SubscriptionDocument extends Document {
  subscriptionId: string;
  productId: string;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>({
  subscriptionId: { type: String, required: true, default: "" },
  productId: { type: String, required: true, default: "" },
});

export const SubscriptionModel = model<SubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
