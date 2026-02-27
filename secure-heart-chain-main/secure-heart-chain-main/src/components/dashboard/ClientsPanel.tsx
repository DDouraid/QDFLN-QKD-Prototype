import { mockClients, type Client } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Shield, Cpu, AlertTriangle } from "lucide-react";

const statusColors: Record<Client["status"], string> = {
  training: "bg-primary/20 text-primary",
  uploading: "bg-accent/20 text-accent",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive/20 text-destructive",
};

const pqcIcons: Record<Client["pqcStatus"], string> = {
  secured: "text-success",
  handshake: "text-warning",
  pending: "text-muted-foreground",
};

interface ClientsPanelProps {
  clients?: Client[] | null;
}

export function ClientsPanel({ clients }: ClientsPanelProps) {
  const data = clients ?? mockClients;

  return (
    <div className="gradient-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">Federated Clients</h3>
      </div>
      <div className="space-y-2">
        {data.map((client) => (
          <div key={client.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
            <Shield className={cn("h-4 w-4 flex-shrink-0", pqcIcons[client.pqcStatus])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{client.name}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono uppercase", statusColors[client.status])}>
                  {client.status}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-[11px] font-mono text-muted-foreground">
                <span>Norm: {client.gradientNorm.toFixed(4)}</span>
                <span>Noise: {client.noiseLevel}</span>
                <span>Samples: {client.datasetSize.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              {client.status === "error" && <AlertTriangle className="h-3 w-3 text-destructive" />}
              {client.lastUpdate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
