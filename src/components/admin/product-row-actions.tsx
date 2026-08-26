"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteProductAction, toggleProductActiveAction } from "@/app/admin/products/actions";

export function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    await toggleProductActiveAction(productId, !isActive);
    router.refresh();
    setPending(false);
  }

  async function handleDelete() {
    const result = await deleteProductAction(productId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={handleToggle} disabled={pending} title={isActive ? "Hide from menu" : "Show in menu"}>
        {isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button variant="ghost" size="icon" render={<Link href={`/admin/products/${productId}`} />} nativeButton={false}>
        <Pencil className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" nativeButton={false} />}>
          <Trash2 className="size-4 text-destructive" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product and its variants. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
