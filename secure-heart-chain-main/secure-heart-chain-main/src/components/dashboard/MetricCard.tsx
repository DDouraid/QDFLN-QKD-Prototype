import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "border-border",
  primary: "border-primary/30 glow-primary",
  success: "border-success/30 glow-success",
  warning: "border-warning/30",
  destructive: "border-destructive/30",
};

const iconVariantStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function MetricCard({ label, value, icon: Icon, variant = "default" }: MetricCardProps) {
  return (
    <div className={cn("gradient-card rounded-lg border p-4 flex flex-col gap-2", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{label}</span>
        <Icon className={cn("h-4 w-4", iconVariantStyles[variant])} />
      </div>
      <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
    </div>
  );
}
