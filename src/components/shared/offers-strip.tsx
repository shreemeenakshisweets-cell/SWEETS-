import { Percent, Truck } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, VOLUME_DISCOUNT_TIERS } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

/**
 * Prominent, always-on-brand display of the automatic offers — sourced
 * directly from pricing.ts constants so this can never drift out of sync
 * with what checkout actually applies.
 */
export function OffersStrip({ className }: { className?: string }) {
  const offers = [
    {
      icon: Truck,
      label: `Free delivery on orders above ${formatCurrency(FREE_DELIVERY_THRESHOLD)}`,
    },
    ...VOLUME_DISCOUNT_TIERS.slice()
      .reverse()
      .map((tier) => ({ icon: Percent, label: tier.label })),
  ];

  return (
    <div className={cn("rounded-2xl border border-border bg-secondary/40", className)}>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        {offers.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <Icon className="size-4 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
