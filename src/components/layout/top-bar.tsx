import { Mail, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { FREE_DELIVERY_THRESHOLD, VOLUME_DISCOUNT_TIERS } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils/currency";

const offers = [
  `Free delivery on orders above ${formatCurrency(FREE_DELIVERY_THRESHOLD)}`,
  ...VOLUME_DISCOUNT_TIERS.slice()
    .reverse()
    .map((tier) => tier.label),
];

/** Slim strip above the header — contact info pinned left, offers scrolling right. */
export function TopBar() {
  return (
    <div className="overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 text-[0.7rem] font-medium sm:text-xs">
        <div className="flex shrink-0 items-center gap-4">
          <a
            href={`tel:${BUSINESS.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-1.5 hover:underline"
          >
            <Phone className="size-3.5" /> {BUSINESS.phone}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="hidden items-center gap-1.5 hover:underline sm:flex"
          >
            <Mail className="size-3.5" /> {BUSINESS.email}
          </a>
        </div>

        <div className="relative min-w-0 flex-1 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {[...offers, ...offers].map((offer, i) => (
              <span key={i}>{offer}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
