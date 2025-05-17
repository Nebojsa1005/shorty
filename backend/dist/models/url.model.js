"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlModel = void 0;
const mongoose_1 = require("mongoose");
const analytics_model_1 = require("./analytics.model");
const UrlSchema = new mongoose_1.Schema({
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
    analytics: { type: mongoose_1.Schema.Types.ObjectId, ref: "Analytics", required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
});
UrlSchema.post("findOneAndDelete", function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (doc && doc.analytics) {
            yield analytics_model_1.AnalyticsModel.deleteOne({ _id: doc.analytics });
        }
    });
});
exports.UrlModel = (0, mongoose_1.model)("Url", UrlSchema);
