import { Schema, model } from 'mongoose';
const AnalyticsSchema = new Schema({
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
export const AnalyticsModel = model('Analytics', AnalyticsSchema);
