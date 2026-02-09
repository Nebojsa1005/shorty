import { Request } from "express";
import * as UAParser from "ua-parser-js";
import geoip from "geoip-lite";

export interface VisitData {
  deviceType: string;
  browser: string;
  os: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  ip: string;
  userAgent: string;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return first.trim();
  }
  return req.socket.remoteAddress || "";
}

function mapDeviceType(type: string | undefined): string {
  if (!type) return "desktop";
  const lower = type.toLowerCase();
  if (lower === "mobile") return "mobile";
  if (lower === "tablet") return "tablet";
  return "desktop";
}

export function parseVisitData(req: Request): VisitData {
  const userAgent = req.headers["user-agent"] || "";
  const result = UAParser.UAParser(userAgent);

  const ip = getClientIp(req);
  const geo = geoip.lookup(ip);

  return {
    deviceType: mapDeviceType(result.device.type),
    browser: result.browser.name || "unknown",
    os: result.os.name || "unknown",
    country: geo?.country || "unknown",
    countryName: geo?.country || "unknown",
    city: geo?.city || "unknown",
    region: geo?.region || "unknown",
    latitude: geo?.ll?.[0] || 0,
    longitude: geo?.ll?.[1] || 0,
    ip,
    userAgent,
  };
}
