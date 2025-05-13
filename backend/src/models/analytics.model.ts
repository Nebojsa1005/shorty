import { Schema, model, Document } from 'mongoose';

export interface AnalyticsDocument extends Document {
  viewCount: number,
  lastViewedOn: Date,
  firstViewedOn: Date,
  shortLink: string
}

const AnalyticsSchema = new Schema<AnalyticsDocument>({
  viewCount: {
	type: Number,
	required: true,
	default: 0
  },
  lastViewedOn: {
	type: Date,
  },
  firstViewedOn: {
	type: Date,
	required: true,
	default: new Date()
  },
  shortLink: {
	type: String,
	required: true
  }
});

export const AnalyticsModel = model<AnalyticsDocument>('Analytics', AnalyticsSchema);
