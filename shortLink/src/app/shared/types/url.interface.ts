import { SecurityOptions } from '../enums/security-options.enum';
import { Analytics } from './analytics.interface';

export interface UrlLink {
  _id: string;
  destinationUrl: string;
  urlName: string;
  security: SecurityOptions;
  suffix?: string;
  password?: string;
  expirationDate?: string
  analytics: Analytics
}

export interface UrlForm {
  value: UrlLink;
  valid: boolean;
}

export interface UrlSecurityOption {
  description: string;
  value: SecurityOptions;
}
