import { Schema, model, Document } from 'mongoose';

export interface UrlDocument extends Document {
  destinationUrl: string;
  shortUrl: string;
  createdAt: Date;
}

const UrlSchema = new Schema<UrlDocument>({
  destinationUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UrlModel = model<UrlDocument>('Url', UrlSchema);
