import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatCurrency } from "@/lib/utils/currency";
import { getAdminProducts } from "@/lib/data/admin/products";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Button render={<Link href="/admin/products/new" />} nativeButton={false} className="gap-2">
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price range</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const prices = product.variants.map((v) => Number(v.price));
              const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {prices.length > 0
                      ? `${formatCurrency(Math.min(...prices))} – ${formatCurrency(Math.max(...prices))}`
                      : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{stock}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.isActive
                          ? "border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"
                          : "border-transparent bg-secondary text-secondary-foreground"
                      }
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductRowActions productId={product.id} isActive={product.isActive} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
