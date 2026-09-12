"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveBannerAction } from "@/app/admin/banners/actions";
import { bannerInputSchema, type BannerInput } from "@/lib/validation/admin";
import { BANNER_THEMES, BANNER_THEME_KEYS } from "@/lib/data/banner-themes";
import type { Banner } from "@/generated/prisma/client";
import { getActionErrorMessage } from "@/lib/utils/errors";

export function BannerFormDialog({
  banner,
  onSaved,
}: {
  banner?: Banner;
  onSaved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerInput>({
    resolver: zodResolver(bannerInputSchema),
    defaultValues: banner
      ? {
          id: banner.id,
          eyebrow: banner.eyebrow ?? "",
          heading: banner.heading,
          body: banner.body,
          ctaLabel: banner.ctaLabel,
          ctaHref: banner.ctaHref,
          theme: banner.theme,
          sortOrder: banner.sortOrder,
          isActive: banner.isActive,
        }
      : {
          eyebrow: "",
          heading: "",
          body: "",
          ctaLabel: "Shop Now",
          ctaHref: "/menu",
          theme: "gold",
          sortOrder: 0,
          isActive: true,
        },
  });

  async function onSubmit(values: BannerInput) {
    try {
      const result = await saveBannerAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(banner ? "Banner updated" : "Banner created");
      setOpen(false);
      reset();
      onSaved();
    } catch (error) {
      toast.error(getActionErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={banner ? "ghost" : "default"} size={banner ? "icon" : "default"} nativeButton={false} />
        }
      >
        {banner ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" /> Add Banner
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit Banner" : "Add Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eyebrow">Small label (optional)</Label>
            <Input id="eyebrow" placeholder="e.g. Limited-time offer" {...register("eyebrow")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heading">Heading</Label>
            <Textarea
              id="heading"
              rows={2}
              placeholder={"Flat 10% off\nyour first order."}
              {...register("heading")}
            />
            <p className="text-xs text-muted-foreground">
              Use a new line for a two-line heading, like the example above.
            </p>
            {errors.heading && (
              <p className="text-xs text-destructive">{errors.heading.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Body text</Label>
            <Textarea id="body" rows={2} {...register("body")} />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctaLabel">Button label</Label>
              <Input id="ctaLabel" {...register("ctaLabel")} />
              {errors.ctaLabel && (
                <p className="text-xs text-destructive">{errors.ctaLabel.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctaHref">Button link</Label>
              <Input id="ctaHref" placeholder="/menu" {...register("ctaHref")} />
              {errors.ctaHref && (
                <p className="text-xs text-destructive">{errors.ctaHref.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="theme">Colour theme</Label>
            <Select
              defaultValue={banner?.theme ?? "gold"}
              onValueChange={(v) => v && setValue("theme", v)}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANNER_THEME_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {BANNER_THEMES[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Pick a festive colour for special occasions, e.g. Festive Red for Diwali.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sortOrder">Order (lower shows first)</Label>
            <Input id="sortOrder" type="number" {...register("sortOrder")} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={watch("isActive")}
              onCheckedChange={(c) => setValue("isActive", c === true)}
            />
            Active (shown in the sliding banner)
          </label>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
