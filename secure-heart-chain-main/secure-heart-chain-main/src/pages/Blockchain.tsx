import { mockBlocks } from "@/lib/mock-data-extended";
import { cn } from "@/lib/utils";
import { Link, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const BlockchainPage = () => {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(47);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-glow">Blockchain Explorer</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">Browse consensus rounds, validator votes, and chain state</p>
      </div>

      {/* Chain stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="gradient-card rounded-lg border border-border p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Chain Height</div>
          <div className="text-xl font-bold font-mono text-primary">47</div>
        </div>
        <div className="gradient-card rounded-lg border border-border p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Finalized</div>
          <div className="text-xl font-bold font-mono text-success">{mockBlocks.filter(b => b.status === "finalized").length}</div>
        </div>
        <div className="gradient-card rounded-lg border border-border p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Disputed</div>
          <div className="text-xl font-bold font-mono text-destructive">{mockBlocks.filter(b => b.status === "disputed").length}</div>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {mockBlocks.slice().reverse().map((block, i) => (
          <div key={block.round} className="flex items-center">
            <button
              onClick={() => setExpandedBlock(expandedBlock === block.round ? null : block.round)}
              className={cn(
                "flex flex-col items-center px-4 py-3 rounded-lg border font-mono text-[11px] transition-all min-w-[80px]",
                block.status === "finalized"
                  ? "border-success/30 bg-success/5 hover:bg-success/10"
                  : "border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
                expandedBlock === block.round && "ring-1 ring-primary/50"
              )}
            >
              <span className="text-muted-foreground text-[9px]">ROUND</span>
              <span className="text-foreground font-bold text-base">{block.round}</span>
              {block.status === "finalized" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-1" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive mt-1" />
              )}
            </button>
            {i < mockBlocks.length - 1 && (
              <div className="w-6 border-t border-dashed border-primary/20 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Expanded block detail */}
      {expandedBlock && (() => {
        const block = mockBlocks.find(b => b.round === expandedBlock);
        if (!block) return null;
        return (
          <div className="gradient-card rounded-lg border border-primary/20 p-5 glow-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">Block #{block.round}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">{block.timestamp}</span>
                </div>
              </div>
              <span className={cn("text-xs font-mono uppercase px-2 py-1 rounded", {
                "bg-success/10 text-success": block.status === "finalized",
                "bg-destructive/10 text-destructive": block.status === "disputed",
              })}>
                {block.status}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Block info */}
              <div className="space-y-2 text-[11px] font-mono">
                <div className="bg-muted/30 rounded p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Hash</span>
                    <span className="text-primary">{block.blockHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prev Hash</span>
                    <span className="text-foreground">{block.prevHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aggregation</span>
                    <span className="text-accent">{block.aggregationMethod.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gradient Norm</span>
                    <span className="text-foreground">{block.gradientNorm.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supermajority</span>
                    <span className={block.supermajority ? "text-success" : "text-destructive"}>
                      {block.supermajority ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clients</span>
                    <span className="text-foreground">{block.participatingClients}</span>
                  </div>
                </div>
              </div>

              {/* Validator votes */}
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Validator Votes</h4>
                <div className="space-y-1.5">
                  {block.validatorVotes.map((vote) => (
                    <div key={vote.validatorId} className={cn(
                      "flex items-center justify-between p-2.5 rounded border text-[11px] font-mono",
                      vote.vote === "agree"
                        ? "bg-success/5 border-success/20"
                        : "bg-destructive/5 border-destructive/20"
                    )}>
                      <div className="flex items-center gap-2">
                        {vote.vote === "agree" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span className="text-foreground">{vote.validatorId}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary/60">{vote.hash}</span>
                        <span className={vote.vote === "agree" ? "text-success" : "text-destructive"}>
                          {vote.vote.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BlockchainPage;
