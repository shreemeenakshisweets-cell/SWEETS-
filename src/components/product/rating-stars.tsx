import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(
                starSize,
                filled ? "fill-primary text-primary" : "fill-muted text-muted"
              )}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating.toFixed(1)}
        {count !== undefined && <span> ({count})</span>}
      </span>
    </div>
  );
}
