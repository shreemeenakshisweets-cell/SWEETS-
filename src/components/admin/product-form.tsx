"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { saveProductAction } from "@/app/admin/products/actions";
import { productInputSchema, type ProductInput } from "@/lib/validation/admin";
import type { Category, Product } from "@/generated/prisma/client";
import type { ProductTag } from "@/types/catalog";
import { getActionErrorMessage } from "@/lib/utils/errors";

const ALL_TAGS: ProductTag[] = ["bestseller", "new", "spicy", "sugar-free", "festive", "limited"];

type ProductWithVariants = Product & {
  variants: { id: string; label: string; weightGrams: number | null; price: unknown; compareAtPrice: unknown; sku: string; stock: number; isDefault: boolean }[];
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductWithVariants;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: product
      ? {
          id: product.id,
          categoryId: product.categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          images: product.images,
          isVeg: product.isVeg,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          tags: product.tags as ProductTag[],
          variants: product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            weightGrams: v.weightGrams,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            sku: v.sku,
            stock: v.stock,
            isDefault: v.isDefault,
          })),
        }
      : {
          categoryId: categories[0]?.id ?? "",
          name: "",
          slug: "",
          description: "",
          images: [],
          isVeg: true,
          isFeatured: false,
          isActive: true,
          tags: [],
          variants: [
            { label: "250 g", price: 0, sku: "", stock: 0, isDefault: true },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const selectedTags = watch("tags") ?? [];

  async function onSubmit(values: ProductInput) {
    try {
      const result = await saveProductAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(getActionErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" placeholder="kaju-katli" {...register("slug")} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="images">Image URLs (one per line)</Label>
        <Textarea
          id="images"
          rows={3}
          defaultValue={product?.images.join("\n")}
          onChange={(e) =>
            setValue(
              "images",
              e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
        {errors.images && (
          <p className="text-xs text-destructive">
            {errors.images.message ?? errors.images.root?.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            defaultValue={product?.categoryId ?? categories[0]?.id}
            onValueChange={(v) => v && setValue("categoryId", v)}
          >
            <SelectTrigger id="categoryId">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            defaultChecked={product?.isVeg ?? true}
            onCheckedChange={(c) => setValue("isVeg", c === true)}
          />
          Pure Veg
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            defaultChecked={product?.isFeatured ?? false}
            onCheckedChange={(c) => setValue("isFeatured", c === true)}
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            defaultChecked={product?.isActive ?? true}
            onCheckedChange={(c) => setValue("isActive", c === true)}
          />
          Active (visible in menu)
        </label>
      </div>

      <div>
        <Label className="mb-2 block">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => {
            const checked = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setValue(
                    "tags",
                    checked ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
                  )
                }
                className={
                  checked
                    ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Variants</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ label: "", price: 0, sku: "", stock: 0, isDefault: false })
            }
          >
            <Plus className="size-3.5" /> Add variant
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3 sm:grid-cols-6"
            >
              <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input placeholder="250 g" {...register(`variants.${index}.label`)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Price</Label>
                <Input type="number" step="0.01" {...register(`variants.${index}.price`)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Compare-at</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`variants.${index}.compareAtPrice`)}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">SKU</Label>
                <Input {...register(`variants.${index}.sku`)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Stock</Label>
                <Input type="number" {...register(`variants.${index}.stock`)} />
              </div>
              <div className="flex items-end justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    defaultChecked={field.isDefault}
                    onCheckedChange={(c) => setValue(`variants.${index}.isDefault`, c === true)}
                  />
                  Default
                </label>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove variant"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {errors.variants?.message && (
          <p className="mt-1 text-xs text-destructive">{errors.variants.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
