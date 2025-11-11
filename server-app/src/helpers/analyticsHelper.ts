export interface ClickLogEntry {
  timestamp: Date;
  country: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
}

export const parseDevice = (ua: string): string => {
  if (!ua) return "Desktop";
  const lower = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lower)) return "Tablet";
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(lower)) return "Mobile";
  return "Desktop";
};

export const parseOS = (ua: string): string => {
  if (!ua) return "Other";
  const lower = ua.toLowerCase();
  if (/windows/i.test(lower)) return "Windows";
  if (/macintosh|mac os x/i.test(lower)) return "macOS";
  if (/iphone|ipad|ipod/i.test(lower)) return "iOS";
  if (/android/i.test(lower)) return "Android";
  if (/linux/i.test(lower)) return "Linux";
  if (/cros/i.test(lower)) return "Chrome OS";
  return "Other";
};

export const parseBrowser = (ua: string): string => {
  if (!ua) return "Other";
  const lower = ua.toLowerCase();
  if (/edg\//i.test(lower)) return "Edge";
  if (/opr\/|opera/i.test(lower)) return "Opera";
  if (/chrome|crios/i.test(lower)) return "Chrome";
  if (/firefox|fxios/i.test(lower)) return "Firefox";
  if (/safari/i.test(lower) && !/chrome|crios/i.test(lower)) return "Safari";
  return "Other";
};

export const parseReferrer = (referrerUrl: string): string => {
  if (!referrerUrl) return "Direct / Bookmark";
  try {
    const host = new URL(referrerUrl).hostname.toLowerCase().replace(/^www\./, "");
    if (/google\./i.test(host)) return "Google Search";
    if (/twitter\.com|t\.co|x\.com/i.test(host)) return "Twitter / X";
    if (/linkedin\./i.test(host)) return "LinkedIn";
    if (/facebook\.com|fb\.com/i.test(host)) return "Facebook";
    if (/instagram\.com/i.test(host)) return "Instagram";
    if (/youtube\.com|youtu\.be/i.test(host)) return "YouTube";
    if (/reddit\.com/i.test(host)) return "Reddit";
    if (/github\.com/i.test(host)) return "GitHub";
    if (/bing\.com/i.test(host)) return "Bing";
    if (/whatsapp/i.test(host)) return "WhatsApp";
    if (/telegram/i.test(host)) return "Telegram";
    return host;
  } catch {
    return "Direct / Other";
  }
};

export const parseCountry = (headers: Record<string, any>): string => {
  const code =
    headers["cf-ipcountry"] ||
    headers["x-vercel-ip-country"] ||
    headers["x-country-code"] ||
    headers["x-country"] ||
    "";

  if (code && typeof code === "string" && code.length === 2) {
    return code.toUpperCase();
  }
  return "Unknown";
};

// Aggregate helper for rich analytics responses
export const computeAnalytics = (clickLogs: ClickLogEntry[]) => {
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const os: Record<string, number> = {};
  const referrers: Record<string, number> = {};
  const countries: Record<string, number> = {};

  // Initialize last 7 days with 0 counts
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    last7Days[dateStr] = 0;
  }

  clickLogs.forEach((log) => {
    // Devices
    devices[log.device] = (devices[log.device] || 0) + 1;

    // Browsers
    browsers[log.browser] = (browsers[log.browser] || 0) + 1;

    // OS
    os[log.os] = (os[log.os] || 0) + 1;

    // Referrers
    referrers[log.referrer] = (referrers[log.referrer] || 0) + 1;

    // Countries
    countries[log.country] = (countries[log.country] || 0) + 1;

    // Date
    if (log.timestamp) {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (last7Days[logDate] !== undefined) {
        last7Days[logDate]++;
      }
    }
  });

  return {
    totalRecordedLogs: clickLogs.length,
    devices,
    browsers,
    os,
    referrers,
    countries,
    timeline: Object.entries(last7Days).map(([date, count]) => ({ date, count })),
    recentActivity: clickLogs.slice(-25).reverse(), // Last 25 clicks, newest first
  };
};
