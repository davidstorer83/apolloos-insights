import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  sparkData?: { day: number; value: number }[];
  subLabel?: string;
}

const KPICard = ({ label, value, change, prefix = "", suffix = "", sparkData, subLabel }: KPICardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = change !== undefined
    ? (label.toLowerCase().includes("cost") || label.toLowerCase().includes("dq") || label.toLowerCase().includes("avg msg")
      ? (change >= 0 ? "text-danger" : "text-success")
      : (change >= 0 ? "text-success" : "text-danger"))
    : "";

  return (
    <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 flex flex-col gap-2 hover:border-primary/30 transition-colors group">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-2xl md:text-3xl font-semibold text-foreground">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
          </span>
          {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}% vs prev period
            </div>
          )}
        </div>
        {sparkData && (
          <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparkData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
