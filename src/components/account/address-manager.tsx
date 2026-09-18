"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { AddressForm } from "@/components/checkout/address-form";
import { deleteAddressAction, setDefaultAddressAction } from "@/app/(shop)/account/addresses/actions";
import type { Address } from "@/generated/prisma/client";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    const result = await deleteAddressAction(id);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Address deleted");
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    setPendingId(id);
    const result = await setDefaultAddressAction(id);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Default address updated");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button nativeButton={false} />}>
            <Plus className="size-4" /> Add Address
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Address</DialogTitle>
            </DialogHeader>
            <AddressForm
              onSaved={() => {
                setAddOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <MapPin className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">No saved addresses yet</p>
          <p className="text-sm text-muted-foreground">
            Add one now, or save it directly during checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{address.fullName}</p>
                  <Badge variant="outline" className="text-[0.65rem]">
                    {address.type}
                  </Badge>
                  {address.isDefault && (
                    <Badge className="border-transparent bg-primary/15 text-[0.65rem] text-primary">
                      Default
                    </Badge>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="ghost" size="icon" nativeButton={false} />}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this address?</AlertDialogTitle>
                      <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(address.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-muted-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                {address.landmark ? `, ${address.landmark}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-muted-foreground">Phone: {address.phone}</p>
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit gap-1.5"
                  disabled={pendingId === address.id}
                  onClick={() => handleSetDefault(address.id)}
                >
                  <Star className="size-3.5" /> Set as default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
