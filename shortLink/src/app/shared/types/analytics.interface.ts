export interface Analytics {
  viewCount: number;
  lastViewedOn: Date;
  firstViewedOn: Date;
  shortLink: string;
  entries: {
    date: Date
    viewCount: number
  }[]
}

export interface AnalyticsOverview {
  totalViews: number;
  totalLinks: number;
  mostAccessedLink: {
    urlName: string;
    shortLink: string;
    viewCount: number;
  } | null;
  uniqueCountries: number;
}

export interface TopLink {
  _id: string;
  visitCount: number;
  shortLink: string;
  urlName: string;
}

export interface DeviceBreakdown {
  deviceTypes: { _id: string; count: number }[];
  browsers: { _id: string; count: number }[];
  operatingSystems: { _id: string; count: number }[];
}

export interface LocationBreakdown {
  countries: { _id: string; count: number }[];
  cities: { _id: string; count: number }[];
}
