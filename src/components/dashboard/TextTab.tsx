import KPICard from "./KPICard";
import FunnelCard from "./FunnelCard";
import {
  textKPIs, messageVolumeData, platformBreakdown,
  flaggedConversations, conversionFunnel,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { AlertTriangle } from "lucide-react";

const TextTab = () => {
  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Conversations Started" value={textKPIs.conversationsStarted.value} change={textKPIs.conversationsStarted.change} sparkData={textKPIs.conversationsStarted.spark} />
        <KPICard label="Replies Received" value={textKPIs.repliesReceived.value} change={textKPIs.repliesReceived.change} sparkData={textKPIs.repliesReceived.spark} subLabel={`${textKPIs.repliesReceived.rate}% reply rate`} />
        <KPICard label="Bookings via Text" value={textKPIs.bookingsText.value} change={textKPIs.bookingsText.change} sparkData={textKPIs.bookingsText.spark} />
        <KPICard label="Avg Messages to Booking" value={textKPIs.avgMsgToBooking.value} change={textKPIs.avgMsgToBooking.change} sparkData={textKPIs.avgMsgToBooking.spark} />
      </div>

      {/* Response Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FunnelCard label="Intro Response Rate" value={62.4} />
        <FunnelCard label="Response to CTA" value={38.1} />
        <FunnelCard label="Response to Booking" value={18.6} />
        <FunnelCard label="CTA to Booking" value={48.8} />
      </div>

      {/* Message Volume */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Message Volume</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={messageVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
            <Bar dataKey="sent" stackId="a" fill="#14e6eb" opacity={0.5} radius={[0, 0, 0, 0]} />
            <Bar dataKey="replies" stackId="a" fill="#34d399" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Platform Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-apollo-card-border">
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Platform</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Conversations</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Replies</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Reply Rate</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Bookings</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Booking Rate</th>
              </tr>
            </thead>
            <tbody>
              {platformBreakdown.map((p) => (
                <tr key={p.platform} className="border-b border-apollo-card-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 text-foreground font-medium">{p.platform}</td>
                  <td className="py-3 text-right text-foreground">{p.conversations.toLocaleString()}</td>
                  <td className="py-3 text-right text-foreground">{p.replies.toLocaleString()}</td>
                  <td className="py-3 text-right text-apollo-cyan">{p.replyRate}%</td>
                  <td className="py-3 text-right text-foreground">{p.bookings}</td>
                  <td className="py-3 text-right text-apollo-green">{p.bookingRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagged Conversations */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Conversations Flagged ({flaggedConversations.length})</h3>
        </div>
        <div className="space-y-2">
          {flaggedConversations.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-apollo-card-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-apollo-cyan">{c.id}</span>
                <span className="text-sm text-foreground">{c.reason}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextTab;
