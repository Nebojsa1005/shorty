export const ANALYTICS_OPTIONS = {
  KEEP: 'keep',
  RESET: 'reset',
} as const;

export type AnalyticsOption = typeof ANALYTICS_OPTIONS[keyof typeof ANALYTICS_OPTIONS];
