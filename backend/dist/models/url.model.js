import { Schema, model } from "mongoose";
import { AnalyticsModel } from "./analytics.model";
const UrlSchema = new Schema({
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
    analytics: { type: Schema.Types.ObjectId, ref: "Analytics", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
UrlSchema.post("findOneAndDelete", async function (doc) {
    if (doc && doc.analytics) {
        await AnalyticsModel.deleteOne({ _id: doc.analytics });
    }
});
export const UrlModel = model("Url", UrlSchema);
