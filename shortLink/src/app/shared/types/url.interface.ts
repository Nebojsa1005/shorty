import { SecurityOptions } from '../enums/security-options.enum';

export interface UrlLink {
  _id: string;
  destinationUrl: string;
  urlName: string;
  security: SecurityOptions;
  suffix?: string;
  password?: string;
  expirationDate?: string
}

export interface UrlForm {
  value: UrlLink;
  valid: boolean;
}

export interface UrlSecurityOption {
  description: string;
  value: SecurityOptions;
}
