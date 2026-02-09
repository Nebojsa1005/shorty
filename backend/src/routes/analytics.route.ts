import { Express } from "express";
import { Types } from "mongoose";
import { UrlModel } from "../models/url.model";
import { VisitModel } from "../models/visit.model";
import { AnalyticsModel } from "../models/analytics.model";
import { ServerResponse } from "../utils/server-response";

async function getAnalyticsIdsForUser(userId: string): Promise<Types.ObjectId[]> {
  const urls = await UrlModel.find({ user: userId }).select("analytics").lean();
  return urls.map((u) => u.analytics as unknown as Types.ObjectId);
}

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    default:
      return null;
  }
}

const analyticsRoutes = (app: Express) => {
  // Overview: total views, total links, most accessed link, unique countries
  app.get("/api/analytics/overview/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const urls = await UrlModel.find({ user: userId })
        .populate("analytics")
        .lean();

      const totalLinks = urls.length;
      let totalViews = 0;
      let mostAccessedLink: any = null;
      let maxViews = 0;

      for (const url of urls) {
        const analytics = url.analytics as any;
        if (analytics) {
          totalViews += analytics.viewCount || 0;
          if ((analytics.viewCount || 0) > maxViews) {
            maxViews = analytics.viewCount;
            mostAccessedLink = {
              urlName: url.urlName,
              shortLink: url.shortLink,
              viewCount: analytics.viewCount,
            };
          }
        }
      }

      const analyticsIds = urls
        .filter((u) => u.analytics)
        .map((u) => (u.analytics as any)._id);

      const uniqueCountries = await VisitModel.distinct("country", {
        analytics: { $in: analyticsIds },
        country: { $ne: "unknown" },
      });

      return ServerResponse.serverSuccess(res, 200, "Overview fetched", {
        totalViews,
        totalLinks,
        mostAccessedLink,
        uniqueCountries: uniqueCountries.length,
      });
    } catch (error: any) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  // Top links by visit count within time period
  app.get("/api/analytics/top-links/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const period = (req.query.period as string) || "all";

      const analyticsIds = await getAnalyticsIdsForUser(userId);
      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No links found", []);
      }

      const matchStage: any = { analytics: { $in: analyticsIds } };
      const periodStart = getPeriodStart(period);
      if (periodStart) {
        matchStage.visitedAt = { $gte: periodStart };
      }

      const topLinks = await VisitModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$analytics", visitCount: { $sum: 1 } } },
        { $sort: { visitCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "analytics",
            localField: "_id",
            foreignField: "_id",
            as: "analyticsDoc",
          },
        },
        { $unwind: "$analyticsDoc" },
        {
          $lookup: {
            from: "urls",
            localField: "_id",
            foreignField: "analytics",
            as: "urlDoc",
          },
        },
        { $unwind: { path: "$urlDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            visitCount: 1,
            shortLink: "$analyticsDoc.shortLink",
            urlName: { $ifNull: ["$urlDoc.urlName", "$analyticsDoc.shortLink"] },
          },
        },
      ]);

      return ServerResponse.serverSuccess(res, 200, "Top links fetched", topLinks);
    } catch (error: any) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  // Device breakdown: device type, browser, OS
  app.get("/api/analytics/device-breakdown/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const analyticsIds = await getAnalyticsIdsForUser(userId);

      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No data", {
          deviceTypes: [],
          browsers: [],
          operatingSystems: [],
        });
      }

      const matchStage = { analytics: { $in: analyticsIds } };

      const [deviceTypes, browsers, operatingSystems] = await Promise.all([
        VisitModel.aggregate([
          { $match: matchStage },
          { $group: { _id: "$deviceType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        VisitModel.aggregate([
          { $match: matchStage },
          { $group: { _id: "$browser", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        VisitModel.aggregate([
          { $match: matchStage },
          { $group: { _id: "$os", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      return ServerResponse.serverSuccess(res, 200, "Device breakdown fetched", {
        deviceTypes,
        browsers,
        operatingSystems,
      });
    } catch (error: any) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  // Location breakdown: country and city
  app.get("/api/analytics/location-breakdown/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const analyticsIds = await getAnalyticsIdsForUser(userId);

      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No data", {
          countries: [],
          cities: [],
        });
      }

      const matchStage = { analytics: { $in: analyticsIds } };

      const [countries, cities] = await Promise.all([
        VisitModel.aggregate([
          { $match: matchStage },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        VisitModel.aggregate([
          { $match: matchStage },
          { $match: { city: { $ne: "unknown" } } },
          { $group: { _id: "$city", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),
      ]);

      return ServerResponse.serverSuccess(res, 200, "Location breakdown fetched", {
        countries,
        cities,
      });
    } catch (error: any) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });
};

export default analyticsRoutes;
