"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function OrderStatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<OrderStatus>(currentStatus);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleUpdate() {
    setSaving(true);
    const result = await updateOrderStatusAction({ orderId, status, note });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Order status updated");
    setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Optional note (e.g. cancellation reason)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <Button onClick={handleUpdate} disabled={saving || status === currentStatus}>
        {saving ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
