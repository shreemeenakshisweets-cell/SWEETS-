"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { createAddressAction } from "@/app/(shop)/checkout/actions";
import { addressInputSchema, type AddressInput } from "@/lib/validation/checkout";
import type { Address } from "@/generated/prisma/client";

export function AddressForm({ onSaved }: { onSaved: (address: Address) => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: { type: "HOME", isDefault: false },
  });

  async function onSubmit(values: AddressInput) {
    const result = await createAddressAction(values);
    if (result.error || !result.address) {
      toast.error(result.error ?? "Could not save address");
      return;
    }
    toast.success("Address saved");
    onSaved(result.address);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Recipient name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="9876543210" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="line1">Address</Label>
        <Input id="line1" placeholder="House no., street" {...register("line1")} />
        {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="line2">Apartment, suite (optional)</Label>
          <Input id="line2" {...register("line2")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="landmark">Landmark (optional)</Label>
          <Input id="landmark" {...register("landmark")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postalCode">PIN code</Label>
          <Input id="postalCode" {...register("postalCode")} />
          {errors.postalCode && (
            <p className="text-xs text-destructive">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Address type</Label>
        <Select defaultValue="HOME" onValueChange={(v) => setValue("type", v as AddressInput["type"])}>
          <SelectTrigger id="type" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HOME">Home</SelectItem>
            <SelectItem value="WORK">Work</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked === true)}
        />
        Set as default address
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save address"}
      </Button>
    </form>
  );
}
