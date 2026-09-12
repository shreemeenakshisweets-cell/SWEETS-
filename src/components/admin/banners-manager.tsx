"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { BannerFormDialog } from "@/components/admin/banner-form-dialog";
import { deleteBannerAction, toggleBannerActiveAction } from "@/app/admin/banners/actions";
import { BANNER_THEMES } from "@/lib/data/banner-themes";
import type { Banner } from "@/generated/prisma/client";

export function BannersManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    const result = await deleteBannerAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Banner deleted");
    router.refresh();
  }

  async function handleToggle(banner: Banner) {
    setPendingId(banner.id);
    await toggleBannerActiveAction(banner.id, !banner.isActive);
    router.refresh();
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Homepage Banners
          </h1>
          <p className="text-sm text-muted-foreground">
            The sliding banner at the top of the homepage — add one for a festival or sale,
            or just edit the ones you have.
          </p>
        </div>
        <BannerFormDialog onSaved={() => router.refresh()} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Heading</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell className="max-w-xs truncate font-medium text-foreground">
                  {banner.heading.replace(/\n/g, " ")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {BANNER_THEMES[banner.theme as keyof typeof BANNER_THEMES]?.label ?? banner.theme}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {banner.sortOrder}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      banner.isActive
                        ? "border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"
                        : "border-transparent bg-secondary text-secondary-foreground"
                    }
                  >
                    {banner.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(banner)}
                      disabled={pendingId === banner.id}
                      title={banner.isActive ? "Hide from homepage" : "Show on homepage"}
                    >
                      {banner.isActive ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                    <BannerFormDialog banner={banner} onSaved={() => router.refresh()} />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" nativeButton={false} />}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This can&apos;t be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(banner.id)}>
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
