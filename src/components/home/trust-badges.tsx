import { Award, Droplet, Leaf, Lock, PackageCheck, Truck } from "lucide-react";

const badges = [
  { icon: Truck, label: "Pan-India Delivery" },
  { icon: Leaf, label: "No Preservatives" },
  { icon: Leaf, label: "100% Pure Veg" },
  { icon: Award, label: "Premium Ingredients" },
  { icon: Droplet, label: "Made with Pure Ghee" },
  { icon: PackageCheck, label: "Hygienic, Secure Packing" },
  { icon: Lock, label: "Safe & Secure Payments" },
] as const;

/**
 * A thin, continuously-scrolling strip of trust signals — deliberately
 * not a static grid (that ate a full screen of height on mobile). Same
 * duplicated-content marquee technique as the top-bar offers ticker.
 */
export function TrustBadges() {
  return (
    <div className="overflow-hidden bg-foreground py-3">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {[...badges, ...badges].map(({ icon: Icon, label }, i) => (
          <div key={i} className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-primary-foreground/90" strokeWidth={1.5} />
            <span className="text-xs font-medium text-background/90">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
