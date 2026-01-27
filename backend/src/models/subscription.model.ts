import { Schema, model, Document } from "mongoose";

export interface SubscriptionDocument extends Document {
  subscriptionId: string;
  productId: string;
  linksAllowed: number;
}

export interface CreateSubscriptionPayload {
  subscriptionId: string;
  productId: string;
}

export interface CreateSubscriptionWebhookPayload {
  userId: string;
  subscriptionId: string;
  productId: string;
}

export interface DeleteSubscriptionPayload {
  userId: string;
}

export const PRODUCT_LINKS_ALLOWED = {
  [541888]: 10,
  [542010]: 50,
  [542013]: 150
} as const


const SubscriptionSchema = new Schema<SubscriptionDocument>({
  subscriptionId: { type: String, default: "" },
  productId: { type: String, default: "" },
  linksAllowed: { type: Number, default: 0},
});

export const SubscriptionModel = model<SubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
