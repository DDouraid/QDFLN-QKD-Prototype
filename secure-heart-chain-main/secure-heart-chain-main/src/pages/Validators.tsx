import { mockValidatorDetails } from "@/lib/mock-data-extended";
import { cn } from "@/lib/utils";
import { ShieldCheck, TrendingDown, AlertTriangle, Coins } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ValidatorsPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-glow">Validators & Staking</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">Validator reputation, stake management, and slashing history</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Stake", value: mockValidatorDetails.reduce((s, v) => s + v.stake, 0).toLocaleString(), color: "text-primary" },
          { label: "Avg Reputation", value: (mockValidatorDetails.reduce((s, v) => s + v.reputation, 0) / mockValidatorDetails.length * 100).toFixed(1) + "%", color: "text-success" },
          { label: "Total Slashes", value: mockValidatorDetails.reduce((s, v) => s + v.slashEvents.length, 0), color: "text-destructive" },
          { label: "Signatures Verified", value: mockValidatorDetails.reduce((s, v) => s + v.verifiedSignatures, 0).toLocaleString(), color: "text-accent" },
        ].map((m) => (
          <div key={m.label} className="gradient-card rounded-lg border border-border p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className={cn("text-xl font-bold font-mono", m.color)}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Validator cards */}
      <div className="space-y-4">
        {mockValidatorDetails.map((v) => (
          <div key={v.id} className={cn(
            "gradient-card rounded-lg border p-5",
            v.status === "slashed" ? "border-destructive/30" : "border-border hover:border-primary/20 transition-colors"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", {
                  "bg-success animate-pulse-glow": v.status === "active",
                  "bg-destructive": v.status === "slashed",
                  "bg-muted-foreground": v.status === "offline",
                })} />
                <div>
                  <h3 className="text-sm font-semibold">{v.name}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">{v.id} · {v.verifiedSignatures} sigs verified · {v.aggregationsPerformed} aggregations</span>
                </div>
              </div>
              <span className={cn("text-xs font-mono uppercase px-2 py-1 rounded", {
                "bg-success/10 text-success": v.status === "active",
                "bg-destructive/10 text-destructive": v.status === "slashed",
              })}>
                {v.status === "slashed" && <TrendingDown className="h-3 w-3 inline mr-1" />}
                {v.status}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Stats */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Current Stake</div>
                    <div className="text-foreground font-semibold flex items-center gap-1"><Coins className="h-3 w-3 text-primary" />{v.stake}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Initial Stake</div>
                    <div className="text-foreground font-semibold">{v.initialStake}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Reputation</div>
                    <div className={cn("font-semibold", v.reputation > 0.7 ? "text-success" : "text-destructive")}>{(v.reputation * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Cosine Sim</div>
                    <div className="text-foreground font-semibold">{v.cosineSimilarity.toFixed(3)}</div>
                  </div>
                </div>

                {/* Slash Events */}
                {v.slashEvents.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-destructive flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3 w-3" /> Slash Events
                    </h4>
                    <div className="space-y-1">
                      {v.slashEvents.map((s, i) => (
                        <div key={i} className="text-[10px] font-mono bg-destructive/5 rounded p-2 border border-destructive/10">
                          <div className="flex justify-between text-destructive">
                            <span>R{s.round}</span>
                            <span>-{s.amount} stake</span>
                          </div>
                          <div className="text-muted-foreground mt-0.5">{s.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stake History */}
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Stake History</h4>
                <div className="bg-muted/20 rounded border border-border/50 p-2 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={v.stakeHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                      <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Line type="stepAfter" dataKey="stake" stroke="hsl(185 100% 50%)" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reputation History */}
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Reputation History</h4>
                <div className="bg-muted/20 rounded border border-border/50 p-2 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={v.reputationHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                      <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Line type="monotone" dataKey="reputation" stroke={v.reputation > 0.7 ? "hsl(145 70% 45%)" : "hsl(0 72% 55%)"} strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidatorsPage;
