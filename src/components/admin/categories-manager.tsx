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
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import {
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "@/app/admin/categories/actions";
import type { Category } from "@/generated/prisma/client";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    const result = await deleteCategoryAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  }

  async function handleToggle(category: Category) {
    setPendingId(category.id);
    await toggleCategoryActiveAction(category.id, !category.isActive);
    router.refresh();
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <CategoryFormDialog onSaved={() => router.refresh()} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {category.sortOrder}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      category.isActive
                        ? "border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"
                        : "border-transparent bg-secondary text-secondary-foreground"
                    }
                  >
                    {category.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(category)}
                      disabled={pendingId === category.id}
                      title={category.isActive ? "Hide from storefront" : "Show on storefront"}
                    >
                      {category.isActive ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                    <CategoryFormDialog category={category} onSaved={() => router.refresh()} />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" nativeButton={false} />}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &ldquo;{category.name}&rdquo;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You can only delete a category once it has no products in it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
