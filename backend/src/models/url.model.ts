import { Schema, model, Document } from "mongoose";
import { AnalyticsDocument, AnalyticsModel } from "./analytics.model";
import { VisitModel } from "./visit.model";
import { UserDocument } from "./user.model";
import { SecurityOptions } from "../types/security-options.enum";
import { LinkStatus } from "../types/link-status.enum";

export interface UrlDocument extends Document {
  destinationUrl: string;
  shortLink: string;
  shortLinkId: string
  createdAt: Date;
  urlName: string;
  suffix: string;
  security: SecurityOptions;
  password: string;
  expirationDate: Date;
  status: LinkStatus;
  expiredAt: Date;
  planExpiresAt: Date;
  deleteAfterExpiredDays: number;
  analytics: AnalyticsDocument;
  user: UserDocument;
}

const UrlSchema = new Schema<UrlDocument>({
  destinationUrl: {
    type: String,
    required: true,
  },
  shortLink: {
    type: String,
    required: true,
  },
  shortLinkId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  urlName: {
    type: String,
    required: true,
  },
  suffix: {
    type: String,
  },
  password: { type: String },
  security: { type: Number },
  expirationDate: { type: Date },
  status: {
    type: String,
    enum: Object.values(LinkStatus),
    default: LinkStatus.ACTIVE,
    index: true,
  },
  expiredAt: { type: Date },
  planExpiresAt: { type: Date },
  deleteAfterExpiredDays: { type: Number },
  analytics: { type: Schema.Types.ObjectId, ref: "Analytics", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

UrlSchema.index({ status: 1, expirationDate: 1 });
UrlSchema.index({ status: 1, planExpiresAt: 1 });
UrlSchema.index({ status: 1, expiredAt: 1 });

UrlSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.analytics) {
    await VisitModel.deleteMany({ analytics: doc.analytics });
    await AnalyticsModel.deleteOne({ _id: doc.analytics });
  }
});

export const UrlModel = model<UrlDocument>("Url", UrlSchema);
