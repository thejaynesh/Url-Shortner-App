export interface ClickActivityLog {
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
  country: string;
}

export interface LinkAnalytics {
  totalRecordedLogs: number;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  os: Record<string, number>;
  referrers: Record<string, number>;
  countries: Record<string, number>;
  timeline: Array<{ date: string; count: number }>;
  recentActivity: ClickActivityLog[];
}

export interface DetailedLinkStats {
  _id: string;
  fullUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  analytics: LinkAnalytics;
}
