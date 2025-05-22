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
exports.analyticsShortLinkCreated = exports.analyticsShortLinkVisited = void 0;
const analytics_model_1 = require("../models/analytics.model");
const analyticsShortLinkVisited = (shortLink) => __awaiter(void 0, void 0, void 0, function* () {
    const existingShortLinkData = yield analytics_model_1.AnalyticsModel.findOne({ shortLink });
    if (existingShortLinkData) {
        yield analytics_model_1.AnalyticsModel.findByIdAndUpdate(existingShortLinkData._id, {
            viewCount: existingShortLinkData.viewCount + 1,
            lastEntered: new Date(),
        });
    }
    else {
        yield analytics_model_1.AnalyticsModel.create({
            shortLink,
            lastEntered: new Date(),
        });
    }
});
exports.analyticsShortLinkVisited = analyticsShortLinkVisited;
const analyticsShortLinkCreated = (shortLink) => __awaiter(void 0, void 0, void 0, function* () {
    return yield analytics_model_1.AnalyticsModel.create({
        shortLink,
    });
});
exports.analyticsShortLinkCreated = analyticsShortLinkCreated;
