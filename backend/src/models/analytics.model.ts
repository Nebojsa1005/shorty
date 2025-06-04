import { Schema, model, Document } from "mongoose";

interface AnalyticsEntries {
  date: Date
  viewCount: number
}
export interface AnalyticsDocument extends Document {
  viewCount: number;
  lastViewedOn: Date;
  firstViewedOn: Date;
  shortLink: string;
  entries: AnalyticsEntries[];
}

const AnalyticsSchema = new Schema<AnalyticsDocument>({
  viewCount: {
    type: Number,
    required: true,
    default: 0,
  },
  lastViewedOn: {
    type: Date,
  },
  firstViewedOn: {
    type: Date,
    required: true,
    default: new Date(),
  },
  shortLink: {
    type: String,
    required: true,
  },
  entries: [
    {
      type: {
        date: Date,
        viewCount: Number
      },
      required: true,
      default: {
        date: new Date(),
        viewCount: 0
      }
    },
  ],
});

export const AnalyticsModel = model<AnalyticsDocument>(
  "Analytics",
  AnalyticsSchema
);
