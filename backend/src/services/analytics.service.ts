import { AnalyticsModel } from "../models/analytics.model";

export const analyticsShortLinkVisited = async (shortLink: string) => {
  const existingShortLinkData = await AnalyticsModel.findOne({ shortLink });

  if (existingShortLinkData) {
    await AnalyticsModel.findByIdAndUpdate(existingShortLinkData._id, {
      viewCount: existingShortLinkData.viewCount + 1,
      lastEntered: new Date(),
    });
  } else {
    await AnalyticsModel.create({
      shortLink,
      lastEntered: new Date(),
    });
  }
};

export const analyticsShortLinkCreated = async (shortLink: string) => {
  return await AnalyticsModel.create({
    shortLink,
  });
};