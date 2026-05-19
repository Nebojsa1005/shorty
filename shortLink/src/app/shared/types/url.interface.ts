import { SecurityOptions } from '../enums/security-options.enum';
import { LinkStatus } from '../enums/link-status.enum';
import { Analytics } from './analytics.interface';

export interface UrlLink {
  _id: string;
  destinationUrl: string;
  urlName: string;
  security: SecurityOptions;
  suffix?: string;
  password?: string;
  userExpirationDate?: string;
  status?: LinkStatus;
  expiredAt?: string;
  planExpirationDate?: string;
  deleteAfterExpiredDays?: number;
  createdAt?: string;
  analytics: Analytics;
}

export interface UrlForm {
  value: UrlLink;
  valid: boolean;
  resetAnalytics?: boolean;
}

export interface UrlSecurityOption {
  description: string;
  value: SecurityOptions;
}
