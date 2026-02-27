import { mockClientDetails } from "@/lib/mock-data-extended";
import { cn } from "@/lib/utils";
import { Shield, Cpu, AlertTriangle, Database, Key, FileSignature } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const statusColors = {
  training: "bg-primary/20 text-primary",
  uploading: "bg-accent/20 text-accent",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive/20 text-destructive",
};

const pqcColors = {
  secured: "text-success",
  handshake: "text-warning",
  pending: "text-muted-foreground",
};

const ClientsPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-glow">Federated Clients</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">Detailed view of all participating FL clients and their training metrics</p>
      </div>

      <div className="space-y-4">
        {mockClientDetails.map((client) => (
          <div key={client.id} className={cn(
            "gradient-card rounded-lg border p-5",
            client.status === "error" ? "border-destructive/30" : "border-border hover:border-primary/20 transition-colors"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className={cn("h-5 w-5", pqcColors[client.pqcStatus])} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{client.name}</h3>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono uppercase", statusColors[client.status])}>
                      {client.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">{client.id}</span>
                </div>
              </div>
              {client.status === "error" && (
                <div className="flex items-center gap-1.5 text-destructive text-xs font-mono">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Anomalous gradient detected
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Metrics */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Cpu className="h-3 w-3" /> Training Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Epochs</div>
                    <div className="text-foreground font-semibold">{client.epochs}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Loss</div>
                    <div className="text-foreground font-semibold">{client.currentLoss.toFixed(4)}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Samples</div>
                    <div className="text-foreground font-semibold">{client.datasetSize.toLocaleString()}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <div className="text-muted-foreground">Grad Norm</div>
                    <div className={cn("font-semibold", client.gradientNorm > 0.1 ? "text-destructive" : "text-foreground")}>
                      {client.gradientNorm.toFixed(4)}
                    </div>
                  </div>
                </div>

                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pt-2">
                  <Key className="h-3 w-3" /> PQC Security
                </h4>
                <div className="text-[11px] font-mono space-y-1 bg-muted/30 rounded p-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">KEM</span><span className="text-primary">{client.kemAlgo}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Signature</span><span className="text-accent">{client.signatureAlgo}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Key ID</span><span className="text-foreground">{client.pqcKeyId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Packets</span><span className="text-foreground">{client.encryptedPackets}</span></div>
                </div>
              </div>

              {/* Loss Chart */}
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Database className="h-3 w-3" /> Loss Curve
                </h4>
                <div className="bg-muted/20 rounded border border-border/50 p-2 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={client.lossHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Line type="monotone" dataKey="loss" stroke="hsl(185 100% 50%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(185 100% 50%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gradient History Chart */}
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <FileSignature className="h-3 w-3" /> Gradient Norm History
                </h4>
                <div className="bg-muted/20 rounded border border-border/50 p-2 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={client.gradientHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                      <XAxis dataKey="round" tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(215 20% 50%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Line type="monotone" dataKey="norm" stroke={client.gradientNorm > 0.1 ? "hsl(0 72% 55%)" : "hsl(270 80% 60%)"} strokeWidth={2} dot={{ r: 2 }} />
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

export default ClientsPage;
