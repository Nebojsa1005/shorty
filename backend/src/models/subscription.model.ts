import { Schema, model, Document } from "mongoose";

export interface SubscriptionDocument extends Document {
  subscriptionId: string;
  productId: string;
  linksAllowed: number;
  status: string;
}

export interface CreateSubscriptionPayload {
  subscriptionId: string;
  productId: string;
}

export interface CreateSubscriptionWebhookPayload {
  userId: string;
  subscriptionId: string;
  productId: string;
  status: string;
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
  status: { type: String, default: "active" },
});

export const SubscriptionModel = model<SubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
