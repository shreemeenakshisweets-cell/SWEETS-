import { Check, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "PACKED", label: "Packed" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export function OrderStatusTimeline({
  currentStatus,
  history,
}: {
  currentStatus: OrderStatus;
  history: { status: OrderStatus; createdAt: Date; note: string | null }[];
}) {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="size-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">This order was cancelled</p>
          {history.find((h) => h.status === "CANCELLED")?.note && (
            <p className="text-xs text-muted-foreground">
              {history.find((h) => h.status === "CANCELLED")?.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
  const historyByStatus = new Map(history.map((h) => [h.status, h]));

  return (
    <ol className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const entry = historyByStatus.get(step.status);
        const isLast = i === STEPS.length - 1;

        return (
          <li key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {reached ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "w-0.5 flex-1 min-h-8",
                    i < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  reached ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                    Current
                  </span>
                )}
              </p>
              {entry && (
                <p className="text-xs text-muted-foreground">
                  {entry.createdAt.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
