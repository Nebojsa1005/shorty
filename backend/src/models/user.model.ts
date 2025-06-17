import { Schema, model, Document } from "mongoose";
import { UrlDocument } from "./url.model";
import { SubscriptionDocument } from "./subscription.model";

export interface UserDocument extends Document {
  email: string;
  name: string;
  createdAt: Date;
  password?: string;
  shortLinks: UrlDocument[];
  subscription: SubscriptionDocument
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shortLinks: [{ type: Schema.Types.ObjectId, ref: "Url", required: true }],
  subscription: { type: Schema.Types.ObjectId, ref: "Subscription", required: true }
});

export const UserModel = model<UserDocument>("User", UserSchema);
