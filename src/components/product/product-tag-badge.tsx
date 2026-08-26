import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductTag } from "@/types/catalog";

const TAG_LABEL: Record<ProductTag, string> = {
  bestseller: "Bestseller",
  new: "New",
  spicy: "Spicy",
  "sugar-free": "Sugar-free",
  festive: "Festive",
  limited: "Limited",
};

const TAG_CLASS: Record<ProductTag, string> = {
  bestseller: "bg-primary text-primary-foreground border-transparent",
  new: "bg-accent text-accent-foreground border-transparent",
  spicy: "bg-destructive/10 text-destructive border-destructive/20",
  "sugar-free": "bg-emerald-600/10 text-emerald-700 border-emerald-600/20 dark:text-emerald-400",
  festive: "bg-secondary text-secondary-foreground border-transparent",
  limited: "bg-foreground text-background border-transparent",
};

export function ProductTagBadge({ tag, className }: { tag: ProductTag; className?: string }) {
  return (
    <Badge className={cn("text-[0.65rem] font-medium", TAG_CLASS[tag], className)}>
      {TAG_LABEL[tag]}
    </Badge>
  );
}
