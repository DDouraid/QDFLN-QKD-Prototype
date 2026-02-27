import { mockValidators, type Validator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ShieldCheck, TrendingDown } from "lucide-react";

const statusColors: Record<Validator["status"], string> = {
  active: "text-success",
  slashed: "text-destructive",
  offline: "text-muted-foreground",
};

interface ValidatorsPanelProps {
  validators?: Validator[] | null;
}

export function ValidatorsPanel({ validators }: ValidatorsPanelProps) {
  const data = validators && validators.length > 0 ? validators : mockValidators;

  return (
    <div className="gradient-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">Validators</h3>
      </div>
      <div className="space-y-2">
        {data.map((v) => (
          <div key={v.id} className={cn(
            "p-3 rounded-md border transition-colors",
            v.status === "slashed" 
              ? "bg-destructive/5 border-destructive/20" 
              : "bg-muted/30 border-border/50 hover:border-primary/20"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", {
                  "bg-success animate-pulse-glow": v.status === "active",
                  "bg-destructive": v.status === "slashed",
                  "bg-muted-foreground": v.status === "offline",
                })} />
                <span className="text-sm font-medium">{v.name}</span>
              </div>
              <span className={cn("text-xs font-mono uppercase", statusColors[v.status])}>
                {v.status === "slashed" && <TrendingDown className="h-3 w-3 inline mr-1" />}
                {v.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-muted-foreground">
              <span>Stake: <span className="text-card-foreground">{v.stake}</span></span>
              <span>Rep: <span className={cn(v.reputation > 0.7 ? "text-success" : "text-destructive")}>{(v.reputation * 100).toFixed(0)}%</span></span>
              <span>Cosine: <span className="text-card-foreground">{v.cosineSimilarity.toFixed(3)}</span></span>
              <span>Anomalies: <span className={cn(v.anomaliesDetected > 3 ? "text-destructive" : "text-card-foreground")}>{v.anomaliesDetected}</span></span>
              <span className="col-span-2">Hash: <span className="text-primary/70">{v.gradientHash}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
