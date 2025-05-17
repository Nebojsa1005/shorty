"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModel = void 0;
const mongoose_1 = require("mongoose");
const AnalyticsSchema = new mongoose_1.Schema({
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
exports.AnalyticsModel = (0, mongoose_1.model)('Analytics', AnalyticsSchema);
