import { Schema, model, Document } from "mongoose";
import { AnalyticsDocument, AnalyticsModel } from "./analytics.model";

export interface UrlDocument extends Document {
  destinationUrl: string;
  shortUrl: string;
  createdAt: Date;
  urlName: string;
  analytics: AnalyticsDocument;
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
    required: true,
  },
  analytics: { type: Schema.Types.ObjectId, ref: "Analytics", required: true },
});

UrlSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.analytics) {
    await AnalyticsModel.deleteOne({ _id: doc.analytics });
  }
});

export const UrlModel = model<UrlDocument>("Url", UrlSchema);
