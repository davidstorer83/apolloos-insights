import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: { day: number; value: number }[];
  color?: string;
  height?: number;
}

const Sparkline = ({ data, color = "#14e6eb", height = 32 }: SparklineProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#spark-${color.replace('#', '')})`}
        dot={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default Sparkline;
