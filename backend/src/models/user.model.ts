import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string
  name: string
  createdAt: Date
  password?: string
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
});

export const UserModel = model<UserDocument>('User', UserSchema);
