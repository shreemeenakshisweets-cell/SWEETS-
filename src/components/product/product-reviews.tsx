"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/product/rating-stars";
import { submitReviewAction } from "@/app/(shop)/menu/[slug]/actions";
import { getActionErrorMessage } from "@/lib/utils/errors";
import { cn } from "@/lib/utils";
import type { ReviewAccess } from "@/lib/data/reviews";
import type { ProductReview } from "@/types/catalog";

function formatDate(iso: string) {
  // Fixed zone + locale so the server and browser render the same string.
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = React.useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Star
            className={cn(
              "size-7",
              n <= shown ? "fill-primary text-primary" : "fill-muted text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  productId,
  existing,
}: {
  productId: string;
  existing: { rating: number; comment: string } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [comment, setComment] = React.useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please choose a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitReviewAction({ productId, rating, comment });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(existing ? "Review updated" : "Thanks for your review!");
      router.refresh();
    } catch (error) {
      toast.error(getActionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
    >
      <p className="font-medium text-foreground">
        {existing ? "Update your review" : "Write a review"}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="How was the taste, freshness and packing? (optional)"
        aria-label="Your review"
      />
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Saving..." : existing ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}

export function ProductReviews({
  productId,
  productSlug,
  ratingAverage,
  ratingCount,
  reviews,
  access,
}: {
  productId: string;
  productSlug: string;
  ratingAverage: number;
  ratingCount: number;
  reviews: ProductReview[];
  access: ReviewAccess;
}) {
  return (
    <section id="reviews" className="mt-16 scroll-mt-24">
      <h2 className="font-heading text-2xl font-semibold text-foreground">Customer reviews</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <div className="flex flex-col items-start gap-2">
          {ratingCount > 0 ? (
            <>
              <p className="font-heading text-5xl font-semibold text-foreground">
                {ratingAverage.toFixed(1)}
              </p>
              <RatingStars rating={ratingAverage} size="md" />
              <p className="text-sm text-muted-foreground">
                Based on {ratingCount} review{ratingCount === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {access.state === "can-review" && (
            <ReviewForm productId={productId} existing={access.existing} />
          )}
          {access.state === "signed-out" && (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Sign in to review this product.
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/login?next=/menu/${productSlug}`} />}
                nativeButton={false}
              >
                Sign in
              </Button>
            </div>
          )}
          {access.state === "not-purchased" && (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Reviews are open to customers who have ordered this product.
            </p>
          )}

          {reviews.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {reviews.map((r) => (
                <li key={r.id} className="flex flex-col gap-1.5 py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <RatingStars rating={r.rating} />
                    <span className="text-sm font-medium text-foreground">{r.author}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                      Verified buyer
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment && (
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
