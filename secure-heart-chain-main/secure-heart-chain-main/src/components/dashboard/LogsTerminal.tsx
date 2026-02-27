import { mockLogs, type LogEntry } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

const levelColors: Record<LogEntry["level"], string> = {
  info: "text-primary/70",
  warn: "text-warning",
  error: "text-destructive",
  success: "text-success",
};

const levelPrefix: Record<LogEntry["level"], string> = {
  info: "INF",
  warn: "WRN",
  error: "ERR",
  success: "OK ",
};

interface LogsTerminalProps {
  logs?: LogEntry[] | null;
}

export function LogsTerminal({ logs }: LogsTerminalProps) {
  const data = logs && logs.length > 0 ? logs : mockLogs;

  return (
    <div className="gradient-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">Pipeline Logs</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>
      <div className="bg-background/80 rounded border border-border/50 p-3 max-h-[280px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-0.5">
        {data.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground/60 flex-shrink-0">{log.timestamp}</span>
            <span className={cn("flex-shrink-0 font-semibold", levelColors[log.level])}>
              [{levelPrefix[log.level]}]
            </span>
            <span className="text-accent/80 flex-shrink-0">[{log.source}]</span>
            <span className="text-card-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
