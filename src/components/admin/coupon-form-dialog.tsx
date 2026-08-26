"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { saveCouponAction } from "@/app/admin/coupons/actions";
import { couponInputSchema, type CouponInput } from "@/lib/validation/admin";
import type { Coupon } from "@/generated/prisma/client";

export function CouponFormDialog({ coupon, onSaved }: { coupon?: Coupon; onSaved: () => void }) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponInputSchema),
    defaultValues: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description ?? "",
          type: coupon.type,
          value: Number(coupon.value),
          minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
          maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
          usageLimit: coupon.usageLimit,
          perUserLimit: coupon.perUserLimit,
          isActive: coupon.isActive,
          startsAt: coupon.startsAt ? coupon.startsAt.toISOString().slice(0, 10) : null,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 10) : null,
        }
      : {
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: 10,
          isActive: true,
        },
  });

  async function onSubmit(values: CouponInput) {
    const result = await saveCouponAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(coupon ? "Coupon updated" : "Coupon created");
    setOpen(false);
    reset();
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={coupon ? "ghost" : "default"} size={coupon ? "icon" : "default"} nativeButton={false} />
        }
      >
        {coupon ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" /> Add Coupon
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" placeholder="WELCOME10" {...register("code")} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                defaultValue={coupon?.type ?? "PERCENTAGE"}
                onValueChange={(v) => v && setValue("type", v as CouponInput["type"])}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FLAT">Flat amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="value">Value</Label>
              <Input id="value" type="number" step="0.01" {...register("value")} />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minOrderValue">Min order value</Label>
              <Input id="minOrderValue" type="number" {...register("minOrderValue")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxDiscount">Max discount</Label>
              <Input id="maxDiscount" type="number" {...register("maxDiscount")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="usageLimit">Usage limit</Label>
              <Input id="usageLimit" type="number" {...register("usageLimit")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perUserLimit">Per-user limit</Label>
              <Input id="perUserLimit" type="number" {...register("perUserLimit")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startsAt">Starts on</Label>
              <Input id="startsAt" type="date" {...register("startsAt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expiresAt">Expires on</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={watch("isActive")}
              onCheckedChange={(c) => setValue("isActive", c === true)}
            />
            Active
          </label>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
