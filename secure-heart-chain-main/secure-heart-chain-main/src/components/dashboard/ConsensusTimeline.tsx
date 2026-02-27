import { mockConsensusRounds, type ConsensusRound } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Link, CheckCircle2, XCircle } from "lucide-react";

interface ConsensusTimelineProps {
  rounds?: ConsensusRound[] | null;
}

export function ConsensusTimeline({ rounds }: ConsensusTimelineProps) {
  const data = rounds ?? mockConsensusRounds;

  return (
    <div className="gradient-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">Blockchain Consensus</h3>
      </div>
      <div className="space-y-1">
        {data.map((round) => (
          <div key={round.round} className={cn(
            "flex items-center gap-3 p-2.5 rounded-md text-[12px] font-mono",
            round.status === "disputed" ? "bg-destructive/5" : "bg-muted/20"
          )}>
            {round.status === "consensus" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
            ) : round.status === "disputed" ? (
              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground flex-shrink-0 animate-pulse-glow" />
            )}
            <span className="text-muted-foreground w-8">R{round.round}</span>
            <span className="text-muted-foreground">{round.timestamp}</span>
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase", {
              "bg-success/15 text-success": round.status === "consensus",
              "bg-destructive/15 text-destructive": round.status === "disputed",
              "bg-warning/15 text-warning": round.status === "pending",
            })}>
              {round.status}
            </span>
            <span className="text-muted-foreground">{round.aggregationMethod.replace("_", " ")}</span>
            <span className="ml-auto text-primary/60">{round.blockHash}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
