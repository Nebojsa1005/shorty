import { Request } from "express";
import { AnalyticsModel } from "../models/analytics.model";
import { VisitModel } from "../models/visit.model";
import { isSameDay } from "../utils/date";
import { parseVisitData } from "../utils/parse-visit-data";

export const analyticsShortLinkVisited = async (shortLink: string, req: Request) => {
  const existingShortLinkData = await AnalyticsModel.findOne({ shortLink });

  if (existingShortLinkData) {
    let todayEntryFound = false;

    existingShortLinkData.entries.forEach((entry) => {
      if (isSameDay(new Date(), entry.date)) {
        entry.viewCount = entry.viewCount + 1;
        todayEntryFound = true;
      }
    });

    const updatedEntries = [...existingShortLinkData.entries];

    if (!todayEntryFound) {
      updatedEntries.push({ date: new Date(), viewCount: 1 });
    }

    await AnalyticsModel.findByIdAndUpdate(existingShortLinkData._id, {
      viewCount: existingShortLinkData.viewCount + 1,
      lastViewedOn: new Date(),
      entries: updatedEntries,
    });

    const visitData = parseVisitData(req);
    await VisitModel.create({
      analytics: existingShortLinkData._id,
      visitedAt: new Date(),
      ...visitData,
    });
  } else {
    const analytics = await AnalyticsModel.create({
      shortLink,
      lastViewedOn: new Date(),
      entries: [
        {
          date: new Date(),
          viewCount: 1,
        },
      ],
    });

    const visitData = parseVisitData(req);
    await VisitModel.create({
      analytics: analytics._id,
      visitedAt: new Date(),
      ...visitData,
    });
  }
};

export const analyticsShortLinkReset = async (shortLink: string) => {
  const analytics = await AnalyticsModel.findOne({ shortLink });

  if (analytics) {
    await VisitModel.deleteMany({ analytics: analytics._id });

    await AnalyticsModel.findByIdAndUpdate(analytics._id, {
      viewCount: 0,
      lastViewedOn: null,
      entries: [{ date: new Date(), viewCount: 0 }],
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
