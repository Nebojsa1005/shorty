import { Schema, model, Document } from "mongoose";

export interface SubscriptionDocument extends Document {
  subscriptionId: string;
  productId: string;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>({
  subscriptionId: { type: String, default: "" },
  productId: { type: String, default: "" },
});

export const SubscriptionModel = model<SubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
