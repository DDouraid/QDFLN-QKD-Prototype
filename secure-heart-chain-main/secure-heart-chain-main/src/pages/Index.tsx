import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  mockMetrics,
  type Client,
  type Validator,
  type LogEntry,
  type ConsensusRound,
} from "@/lib/mock-data";
import { runRound, type RunRoundResponse } from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ClientsPanel } from "@/components/dashboard/ClientsPanel";
import { ValidatorsPanel } from "@/components/dashboard/ValidatorsPanel";
import { ConsensusTimeline } from "@/components/dashboard/ConsensusTimeline";
import { LogsTerminal } from "@/components/dashboard/LogsTerminal";
import { NetworkTopology } from "@/components/dashboard/NetworkTopology";
import {
  Activity,
  Users,
  ShieldCheck,
  BarChart3,
  Key,
  Box,
  Skull,
  Percent,
} from "lucide-react";

function mapClients(data?: RunRoundResponse): Client[] | undefined {
  if (!data) return undefined;
  return data.clients.map((c, idx) => ({
    id: c.id,
    name: `Client ${c.id}`,
    status: c.malicious ? "error" : "training",
    datasetSize: 10_000 + idx * 500,
    gradientNorm: c.grad_norm,
    noiseLevel: 0.01,
    lastUpdate: "just now",
    pqcStatus: "secured",
  }));
}

function mapValidators(data?: RunRoundResponse): Validator[] | undefined {
  if (!data) return undefined;
  return data.validators.map((v) => ({
    id: v.id,
    name: `Validator ${v.id}`,
    stake:
      "consensus" in data.consensus && "stake" in data.consensus
        ? data.consensus.stake[v.id] ?? 10
        : 10,
    reputation:
      "consensus" in data.consensus && "reputation" in data.consensus
        ? (data.consensus.reputation[v.id] ?? 0) / 10
        : 0.9,
    status:
      "consensus" in data.consensus &&
      "fraudsters" in data.consensus &&
      data.consensus.fraudsters.includes(v.id)
        ? "slashed"
        : "active",
    gradientHash: v.H_agg.slice(0, 12) + "...",
    anomaliesDetected: v.malicious ? 1 : 0,
    cosineSimilarity: v.malicious ? 0.3 : 0.95,
    suspicionCount: v.malicious ? 2 : 0,
  }));
}

function mapConsensusRounds(
  data?: RunRoundResponse,
): ConsensusRound[] | undefined {
  if (!data) return undefined;
  const c = data.consensus as any;
  if (!c || !c.H_star) return undefined;
  return [
    {
      round: data.round_id,
      timestamp: "now",
      status: c.stake_pct >= 66.7 ? "consensus" : "disputed",
      participatingValidators: Object.keys(c.entries ?? {}).length,
      aggregationMethod: "median",
      blockHash: c.H_star.slice(0, 12) + "...",
      supermajority: c.stake_pct >= 66.7,
    },
  ];
}

function mapLogs(data?: RunRoundResponse): LogEntry[] | undefined {
  if (!data) return undefined;
  const now = new Date();
  const baseTime = now.toTimeString().split(" ")[0];
  return data.logs.map((msg, idx) => {
    let level: LogEntry["level"] = "info";
    const lower = msg.toLowerCase();
    if (lower.includes("warn")) level = "warn";
    else if (lower.includes("error") || lower.includes("err")) level = "error";
    else if (lower.includes("ok") || lower.includes("consensus"))
      level = "success";

    return {
      timestamp: `${baseTime}.${String(idx).padStart(3, "0")}`,
      level,
      source: "Pipeline",
      message: msg,
    };
  });
}

const Index = () => {
  const mutation = useMutation({
    mutationFn: runRound,
  });

  const clients = useMemo(
    () => mapClients(mutation.data) ?? undefined,
    [mutation.data],
  );
  const validators = useMemo(
    () => mapValidators(mutation.data) ?? undefined,
    [mutation.data],
  );
  const consensusRounds = useMemo(
    () => mapConsensusRounds(mutation.data) ?? undefined,
    [mutation.data],
  );
  const logs = useMemo(
    () => mapLogs(mutation.data) ?? undefined,
    [mutation.data],
  );

  const topologyConsensusOk = useMemo(() => {
    if (!mutation.data) return true;
    const anyMalicious = mutation.data.clients.some((c) => c.malicious);
    const c = mutation.data.consensus as any;
    const backendOk =
      c && typeof c.stake_pct === "number" ? c.stake_pct >= 66.7 : false;
    return backendOk && !anyMalicious;
  }, [mutation.data]);

  const latestMetrics = useMemo(() => {
    if (!mutation.data) return mockMetrics;
    const c = mutation.data.consensus as any;
    const activeValidators = c?.reputation
      ? Object.keys(c.reputation).length
      : mockMetrics.activeValidators;
    const consensusRate =
      typeof c?.stake_pct === "number"
        ? c.stake_pct
        : mockMetrics.consensusRate;
    const avgGradientNorm =
      mutation.data.validators.length > 0
        ? mutation.data.validators.reduce(
            (acc, v) => acc + v.grad_norm,
            0,
          ) / mutation.data.validators.length
        : mockMetrics.avgGradientNorm;

    return {
      ...mockMetrics,
      totalRounds: mutation.data.round_id,
      activeClients: mutation.data.clients.length,
      activeValidators,
      consensusRate,
      avgGradientNorm,
    };
  }, [mutation.data]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">DFLN Overview</h2>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center rounded-md border border-border bg-primary text-primary-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:bg-primary/90 disabled:opacity-60"
        >
          {mutation.isPending ? "Running round..." : "Run round"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          label="Rounds"
          value={latestMetrics.totalRounds}
          icon={Activity}
          variant="primary"
        />
        <MetricCard
          label="Clients"
          value={latestMetrics.activeClients}
          icon={Users}
          variant="success"
        />
        <MetricCard
          label="Validators"
          value={latestMetrics.activeValidators}
          icon={ShieldCheck}
          variant="success"
        />
        <MetricCard
          label="Consensus"
          value={`${latestMetrics.consensusRate}%`}
          icon={Percent}
          variant="primary"
        />
        <MetricCard
          label="Avg Norm"
          value={latestMetrics.avgGradientNorm}
          icon={BarChart3}
        />
        <MetricCard
          label="PQC Keys"
          value={latestMetrics.pqcKeysExchanged}
          icon={Key}
        />
        <MetricCard
          label="Blocks"
          value={latestMetrics.blocksFinalized}
          icon={Box}
        />
        <MetricCard
          label="Slashes"
          value={latestMetrics.slashEvents}
          icon={Skull}
          variant="destructive"
        />
      </div>

      <NetworkTopology clients={clients} consensusOk={topologyConsensusOk} />

      <div className="grid lg:grid-cols-2 gap-6">
        <ClientsPanel clients={clients} />
        <ValidatorsPanel validators={validators} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ConsensusTimeline rounds={consensusRounds} />
        <LogsTerminal logs={logs} />
      </div>
    </div>
  );
};

export default Index;
