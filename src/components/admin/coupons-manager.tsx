"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CouponFormDialog } from "@/components/admin/coupon-form-dialog";
import { deleteCouponAction, toggleCouponActiveAction } from "@/app/admin/coupons/actions";
import { formatCurrency } from "@/lib/utils/currency";
import type { Coupon } from "@/generated/prisma/client";

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();

  async function handleToggle(id: string, isActive: boolean) {
    await toggleCouponActiveAction(id, isActive);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteCouponAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Coupon deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <CouponFormDialog onSaved={() => router.refresh()} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{coupon.code}</p>
                  {coupon.description && (
                    <p className="text-xs text-muted-foreground">{coupon.description}</p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatCurrency(Number(coupon.value))}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.expiresAt
                    ? coupon.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })
                    : "No expiry"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={(checked) => handleToggle(coupon.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CouponFormDialog coupon={coupon} onSaved={() => router.refresh()} />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" nativeButton={false} />}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &ldquo;{coupon.code}&rdquo;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This can&apos;t be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(coupon.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
