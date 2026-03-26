export const LEAD_SOURCES = [
  "All Sources",
  "Meta Lead Form",
  "Web Form",
  "Instagram DM",
  "Facebook DM",
  "TikTok DM",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const sparklineData = (base: number, count = 7) =>
  Array.from({ length: count }, (_, i) => ({
    day: i,
    value: base + Math.round((Math.random() - 0.4) * base * 0.3),
  }));

export const overviewKPIs = {
  totalLeads: { value: 2847, change: 12.4, spark: sparklineData(2847) },
  totalBookings: { value: 438, change: 8.2, spark: sparklineData(438) },
  leadToBooking: { value: 15.4, change: 2.1, spark: sparklineData(15) },
  costPerBooking: { value: 42.3, change: -6.8, spark: sparklineData(42) },
};

export const conversionFunnel = {
  introResponse: { value: 68.2, label: "Intro Response Rate" },
  responseToCTA: { value: 42.5, label: "Response to CTA" },
  responseToBooking: { value: 22.8, label: "Response to Booking" },
  ctaToBooking: { value: 53.6, label: "CTA to Booking" },
};

export const engagementStats = {
  avgMessages: { value: 8.4, label: "Avg Messages / Conversion" },
  avgInteractions: { value: 12.6, label: "Avg Interactions / Conversion" },
  dqRate: { value: 18.3, count: 521, label: "Leads DQ'd" },
};

export const responseRatesByStage = [
  { stage: "Intro", rate: 68 },
  { stage: "Q1", rate: 55 },
  { stage: "Q2", rate: 43 },
  { stage: "Q3", rate: 38 },
  { stage: "CTA", rate: 31 },
];

export const leadsByStage = [
  { stage: "Contacted", count: 2847 },
  { stage: "Responded", count: 1942 },
  { stage: "Engaged", count: 826 },
  { stage: "CTA Sent", count: 612 },
  { stage: "Booked", count: 438 },
];

export const footerStats = {
  timeSaved: { value: 1284, unit: "hrs" },
  moneySaved: { value: 68400, unit: "$" },
  avgAttempts: { value: 3.2, unit: "" },
  activeConversations: { value: 147, unit: "" },
};

// Voice tab
export const voiceKPIs = {
  callsMade: { value: 4218, change: 15.3, spark: sparklineData(4218) },
  callsAnswered: { value: 2847, change: 9.1, rate: 67.5, spark: sparklineData(2847) },
  bookingsVoice: { value: 312, change: 11.4, spark: sparklineData(312) },
  avgCallDuration: { value: "3:42", change: -4.2, spark: sparklineData(220) },
};

export const callOutcomes = [
  { label: "Booked", value: 312, color: "#34d399" },
  { label: "Callback Requested", value: 428, color: "#14e6eb" },
  { label: "Not Interested", value: 684, color: "#6366f1" },
  { label: "Not Qualified", value: 521, color: "#f59e0b" },
  { label: "Voicemail / No Answer", value: 1089, color: "#64748b" },
  { label: "DND", value: 184, color: "#ef4444" },
];

export const callSentiment = {
  positive: 42.8,
  neutral: 38.4,
  negative: 18.8,
};

export const callPerformanceData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  calls: 100 + Math.round(Math.random() * 80),
  bookings: 5 + Math.round(Math.random() * 15),
}));

export const sentimentTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: 65 + Math.round(Math.random() * 20),
}));

export const flaggedCalls = [
  { id: "C-1042", reason: "Customer expressed frustration", time: "2h ago" },
  { id: "C-1038", reason: "Agent deviation from script", time: "4h ago" },
  { id: "C-1021", reason: "Long silence detected", time: "6h ago" },
  { id: "C-1015", reason: "Compliance keyword triggered", time: "8h ago" },
];

// Text tab
export const textKPIs = {
  conversationsStarted: { value: 3841, change: 18.6, spark: sparklineData(3841) },
  repliesReceived: { value: 2106, change: 7.4, rate: 54.8, spark: sparklineData(2106) },
  bookingsText: { value: 284, change: 13.2, spark: sparklineData(284) },
  avgMsgToBooking: { value: 11.2, change: -8.1, spark: sparklineData(11) },
};

export const messageVolumeData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  sent: 80 + Math.round(Math.random() * 60),
  replies: 30 + Math.round(Math.random() * 40),
}));

export const platformBreakdown = [
  { platform: "SMS", conversations: 1842, replies: 1106, replyRate: 60.0, bookings: 142, bookingRate: 12.8 },
  { platform: "Instagram DM", conversations: 924, replies: 462, replyRate: 50.0, bookings: 68, bookingRate: 14.7 },
  { platform: "Facebook DM", conversations: 682, replies: 348, replyRate: 51.0, bookings: 48, bookingRate: 13.8 },
  { platform: "TikTok DM", conversations: 393, replies: 190, replyRate: 48.3, bookings: 26, bookingRate: 13.7 },
];

export const flaggedConversations = [
  { id: "T-2041", reason: "Aggressive language detected", time: "1h ago" },
  { id: "T-2038", reason: "Bot loop detected", time: "3h ago" },
  { id: "T-2022", reason: "User requested human agent", time: "5h ago" },
];

// Sales pipeline
export const salesPipeline = {
  booked: { value: 438, label: "Sessions Booked" },
  noShows: { value: 62, rate: 14.2, label: "No Shows" },
  completed: { value: 376, label: "Sessions Completed" },
  offered: { value: 298, rate: 79.3, label: "Offers Made" },
  closed: { value: 184, rate: 61.7, label: "Sales Closed" },
  totalContract: { value: 736000, label: "Total Contract Value" },
  cashCollected: { value: 482400, label: "Cash Collected" },
  remaining: { value: 253600, label: "Remaining Balance" },
};
