import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  changePct,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  changePct?: number | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold text-foreground">{value}</p>
      {changePct !== undefined && changePct !== null && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            changePct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          )}
        >
          {changePct >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          {Math.abs(changePct).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}
