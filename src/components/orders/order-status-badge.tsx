import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-secondary text-secondary-foreground",
  CONFIRMED: "bg-primary/15 text-primary",
  PREPARING: "bg-primary/15 text-primary",
  PACKED: "bg-primary/15 text-primary",
  OUT_FOR_DELIVERY: "bg-accent/15 text-accent",
  DELIVERED: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn("border-transparent font-medium", CLASS[status])}>{LABEL[status]}</Badge>
  );
}
