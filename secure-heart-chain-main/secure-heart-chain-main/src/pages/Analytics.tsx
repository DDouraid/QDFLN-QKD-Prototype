import { analyticsData } from "@/lib/mock-data-extended";
import { BarChart3, Shield, Activity, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const chartTooltipStyle = {
  background: "hsl(222 40% 9%)",
  border: "1px solid hsl(222 30% 18%)",
  borderRadius: 6,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
};

const AnalyticsPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-glow">Analytics</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">Time-series metrics across rounds — gradients, consensus, anomalies, PQC operations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Consensus Rate */}
        <div className="gradient-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold font-mono uppercase tracking-wider">Consensus Rate Over Time</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.consensusOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="rate" stroke="hsl(145 70% 45%)" fill="hsl(145 70% 45% / 0.15)" strokeWidth={2} name="Consensus %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gradient Norms */}
        <div className="gradient-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold font-mono uppercase tracking-wider">Gradient Norms</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.gradientNormOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Line type="monotone" dataKey="avgNorm" stroke="hsl(185 100% 50%)" strokeWidth={2} dot={false} name="Avg Norm" />
                <Line type="monotone" dataKey="maxNorm" stroke="hsl(270 80% 60%)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Max Norm" />
                <Line type="monotone" dataKey="anomalyThreshold" stroke="hsl(0 72% 55%)" strokeWidth={1} strokeDasharray="8 4" dot={false} name="Threshold" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomalies & Slashes */}
        <div className="gradient-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold font-mono uppercase tracking-wider">Anomalies & Slashing</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.anomalyTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Bar dataKey="anomalies" fill="hsl(38 92% 55%)" name="Anomalies" radius={[2, 2, 0, 0]} />
                <Bar dataKey="slashes" fill="hsl(0 72% 55%)" name="Slashes" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PQC Operations */}
        <div className="gradient-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold font-mono uppercase tracking-wider">PQC Operations Per Round</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.pqcOperations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Bar dataKey="keyExchanges" fill="hsl(185 100% 50%)" name="Key Exchanges" radius={[2, 2, 0, 0]} />
                <Bar dataKey="signatures" fill="hsl(270 80% 60%)" name="Signatures" radius={[2, 2, 0, 0]} />
                <Bar dataKey="verifications" fill="hsl(145 70% 45%)" name="Verifications" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
