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

/** Full-width strip of trust signals — what makes this a shop worth ordering from. */
export function TrustBadges() {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6 lg:px-8">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="size-6 text-primary-foreground/90" strokeWidth={1.5} />
            <span className="max-w-20 text-xs font-medium tracking-tight text-background/90">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
