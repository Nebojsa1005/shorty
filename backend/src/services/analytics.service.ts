import { AnalyticsModel } from "../models/analytics.model";
import { isSameDay } from "../utils/date";

export const analyticsShortLinkVisited = async (shortLink: string) => {
  const existingShortLinkData = await AnalyticsModel.findOne({ shortLink });

  if (existingShortLinkData) {
    existingShortLinkData.entries.forEach((entry) => {
      if (isSameDay(new Date(), entry.date)) {
        entry.viewCount = entry.viewCount + 1;
      }
    });

    console.log(existingShortLinkData);

    await AnalyticsModel.findByIdAndUpdate(existingShortLinkData._id, {
      viewCount: existingShortLinkData.viewCount + 1,
      lastEntered: new Date(),
      entries: [...existingShortLinkData.entries],
    });
  } else {
    await AnalyticsModel.create({
      shortLink,
      lastEntered: new Date(),
      entries: [
        {
          date: new Date(),
          viewCount: 1,
        },
      ],
    });
  }
};

export const analyticsShortLinkCreated = async (shortLink: string) => {
  return await AnalyticsModel.create({
    shortLink,
    entries: [
      {
        date: new Date(),
        viewCount: 0,
      },
    ],
  });
};
