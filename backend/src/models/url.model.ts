import { Schema, model, Document } from 'mongoose';

export interface UrlDocument extends Document {
  destinationUrl: string;
  shortUrl: string;
  createdAt: Date;
  urlName: string
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
  urlName: {
    type: String,
    required: true
  },
});

export const UrlModel = model<UrlDocument>('Url', UrlSchema);
