import { Express } from "express";
import { Types } from "mongoose";
import { UrlModel } from "../models/url.model";
import { VisitModel } from "../models/visit.model";
import { AnalyticsModel } from "../models/analytics.model";
import { ServerResponse } from "../utils/server-response";
import { populateUserSubscription } from "../services/user.service";
import { getPlanFeaturesForProduct } from "../utils/plan-features";

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

async function getPlanFeaturesHelper(userId: string) {
  const user = await populateUserSubscription(userId);
  return getPlanFeaturesForProduct(user.subscription?.productId);
}

function getRetentionCutoff(retentionDays: number | null): Date | null {
  if (retentionDays === null) return null;
  const d = new Date();
  d.setDate(d.getDate() - retentionDays);
  return d;
}

const analyticsRoutes = (app: Express) => {
  // Overview: total views, total links, most accessed link, unique countries
  app.get("/api/analytics/overview/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const planFeatures = await getPlanFeaturesHelper(userId);
      const retentionCutoff = getRetentionCutoff(planFeatures.analyticsRetentionDays);

      const urls = await UrlModel.find({ user: userId }).lean();
      const totalLinks = urls.length;

      const analyticsIds = urls
        .filter((u) => u.analytics)
        .map((u) => u.analytics as unknown as Types.ObjectId);

      const visitFilter: any = { analytics: { $in: analyticsIds } };
      if (retentionCutoff) {
        visitFilter.visitedAt = { $gte: retentionCutoff };
      }

      // Total views within retention window
      const totalViews = await VisitModel.countDocuments(visitFilter);

      // Most accessed link within retention window
      let mostAccessedLink: any = null;
      if (analyticsIds.length > 0) {
        const topLinkAgg = await VisitModel.aggregate([
          { $match: visitFilter },
          { $group: { _id: "$analytics", visitCount: { $sum: 1 } } },
          { $sort: { visitCount: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "urls",
              localField: "_id",
              foreignField: "analytics",
              as: "urlDoc",
            },
          },
          { $unwind: { path: "$urlDoc", preserveNullAndEmptyArrays: true } },
        ]);

        if (topLinkAgg.length > 0) {
          const top = topLinkAgg[0];
          mostAccessedLink = {
            urlName: top.urlDoc?.urlName || String(top._id),
            shortLink: top.urlDoc?.shortLink || "",
            viewCount: top.visitCount,
          };
        }
      }

      // Unique countries within retention window
      const uniqueCountries = await VisitModel.distinct("country", {
        analytics: { $in: analyticsIds },
        ...(retentionCutoff ? { visitedAt: { $gte: retentionCutoff } } : {}),
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

      const planFeatures = await getPlanFeaturesHelper(userId);

      // Essential: no top links feature
      if (planFeatures.topLinksCount === 0) {
        return ServerResponse.serverSuccess(res, 200, "Top links fetched", []);
      }

      const analyticsIds = await getAnalyticsIdsForUser(userId);
      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No links found", []);
      }

      const retentionCutoff = getRetentionCutoff(planFeatures.analyticsRetentionDays);

      const matchStage: any = { analytics: { $in: analyticsIds } };
      const periodStart = getPeriodStart(period);
      if (periodStart) {
        matchStage.visitedAt = { $gte: periodStart };
      } else if (retentionCutoff) {
        matchStage.visitedAt = { $gte: retentionCutoff };
      }

      const topLinks = await VisitModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$analytics", visitCount: { $sum: 1 } } },
        { $sort: { visitCount: -1 } },
        { $limit: planFeatures.topLinksCount },
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

      const planFeatures = await getPlanFeaturesHelper(userId);
      if (!planFeatures.canExportAnalytics) {
        return ServerResponse.serverError(res, 403, "Device breakdown requires a Pro or Ultimate plan");
      }

      const analyticsIds = await getAnalyticsIdsForUser(userId);

      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No data", {
          deviceTypes: [],
          browsers: [],
          operatingSystems: [],
        });
      }

      const retentionCutoff = getRetentionCutoff(planFeatures.analyticsRetentionDays);
      const matchStage: any = { analytics: { $in: analyticsIds } };
      if (retentionCutoff) {
        matchStage.visitedAt = { $gte: retentionCutoff };
      }

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

      const planFeatures = await getPlanFeaturesHelper(userId);
      if (!planFeatures.canExportAnalytics) {
        return ServerResponse.serverError(res, 403, "Location breakdown requires a Pro or Ultimate plan");
      }

      const analyticsIds = await getAnalyticsIdsForUser(userId);

      if (analyticsIds.length === 0) {
        return ServerResponse.serverSuccess(res, 200, "No data", {
          countries: [],
          cities: [],
        });
      }

      const retentionCutoff = getRetentionCutoff(planFeatures.analyticsRetentionDays);
      const matchStage: any = { analytics: { $in: analyticsIds } };
      if (retentionCutoff) {
        matchStage.visitedAt = { $gte: retentionCutoff };
      }

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

  // Export analytics as CSV
  app.get("/api/analytics/export/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const planFeatures = await getPlanFeaturesHelper(userId);
      if (!planFeatures.canExportAnalytics) {
        return ServerResponse.serverError(res, 403, "Analytics export requires a Pro or Ultimate plan");
      }

      const analyticsIds = await getAnalyticsIdsForUser(userId);
      if (analyticsIds.length === 0) {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=analytics.csv");
        return res.send("urlName,shortLink,visitCount\n");
      }

      const retentionCutoff = getRetentionCutoff(planFeatures.analyticsRetentionDays);
      const matchStage: any = { analytics: { $in: analyticsIds } };
      if (retentionCutoff) {
        matchStage.visitedAt = { $gte: retentionCutoff };
      }

      const topLinks = await VisitModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$analytics", visitCount: { $sum: 1 } } },
        { $sort: { visitCount: -1 } },
        { $limit: planFeatures.topLinksCount },
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

      const rows = topLinks.map((link) => {
        const urlName = String(link.urlName || "").replace(/,/g, " ");
        const shortLink = String(link.shortLink || "").replace(/,/g, " ");
        return `${urlName},${shortLink},${link.visitCount}`;
      });

      const csv = ["urlName,shortLink,visitCount", ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=analytics.csv");
      return res.send(csv);
    } catch (error: any) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });
};

export default analyticsRoutes;
