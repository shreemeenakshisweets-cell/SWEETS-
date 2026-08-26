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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveCategoryAction } from "@/app/admin/categories/actions";
import { categoryInputSchema, type CategoryInput } from "@/lib/validation/admin";
import type { Category } from "@/generated/prisma/client";

export function CategoryFormDialog({
  category,
  onSaved,
}: {
  category?: Category;
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
  } = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        }
      : {
          name: "",
          slug: "",
          description: "",
          imageUrl: "",
          isActive: true,
          sortOrder: 0,
        },
  });

  async function onSubmit(values: CategoryInput) {
    const result = await saveCategoryAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(category ? "Category updated" : "Category created");
    setOpen(false);
    reset();
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={category ? "ghost" : "default"} size={category ? "icon" : "default"} nativeButton={false} />
        }
      >
        {category ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" /> Add Category
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="sweets" {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...register("imageUrl")} />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input id="sortOrder" type="number" {...register("sortOrder")} />
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
