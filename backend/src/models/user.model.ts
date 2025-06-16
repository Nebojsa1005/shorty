import { Schema, model, Document } from 'mongoose';
import { UrlDocument } from './url.model';

export interface UserDocument extends Document {
  email: string
  name: string
  createdAt: Date
  password?: string,
  shortLinks: UrlDocument[]
  subscriptionPlanId: string
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
  subscriptionPlanId: { type: String, required: true, default: '' }
});

export const UserModel = model<UserDocument>('User', UserSchema);
