import { Schema, model, Document } from "mongoose";

export interface VisitDocument extends Document {
  analytics: Schema.Types.ObjectId;
  visitedAt: Date;
  deviceType: string;
  browser: string;
  os: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  ip: string;
  userAgent: string;
}

const VisitSchema = new Schema<VisitDocument>({
  analytics: {
    type: Schema.Types.ObjectId,
    ref: "Analytics",
    required: true,
    index: true,
  },
  visitedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  deviceType: { type: String, default: "unknown" },
  browser: { type: String, default: "unknown" },
  os: { type: String, default: "unknown" },
  country: { type: String, default: "unknown" },
  countryName: { type: String, default: "unknown" },
  city: { type: String, default: "unknown" },
  region: { type: String, default: "unknown" },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
});

VisitSchema.index({ analytics: 1, visitedAt: 1 });

export const VisitModel = model<VisitDocument>("Visit", VisitSchema);
