export const LEAD_SOURCES = [
  "All Sources",
  "Meta Lead Form",
  "Web Form",
  "Instagram DM",
  "Facebook DM",
  "TikTok DM",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];
