import { Schema, model, Document } from 'mongoose';

export interface UrlDocument extends Document {
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
}

const UrlSchema = new Schema<UrlDocument>({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UrlModel = model<UrlDocument>('Url', UrlSchema);
