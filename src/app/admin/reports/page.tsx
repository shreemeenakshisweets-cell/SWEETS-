import Link from "next/link";
import type { Metadata } from "next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/currency";
import { getProductPerformance, getSalesReport, type ReportRange } from "@/lib/data/admin/reports";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

const RANGES: { label: string; value: ReportRange }[] = [
  { label: "Daily (last 30 days)", value: "daily" },
  { label: "Weekly (last 12 weeks)", value: "weekly" },
  { label: "Monthly (last 12 months)", value: "monthly" },
];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = (sp.range as ReportRange) || "daily";

  const [sales, products] = await Promise.all([getSalesReport(range), getProductPerformance()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Sales and product performance.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/reports?range=${r.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              range === r.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <section className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No sales in this range yet.
                </TableCell>
              </TableRow>
            )}
            {sales.map((row) => (
              <TableRow key={row.period}>
                <TableCell className="font-medium text-foreground">{row.period}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{row.orders}</TableCell>
                <TableCell className="tabular-nums text-foreground">
                  {formatCurrency(row.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
          Product Performance
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No sales data yet.
                  </TableCell>
                </TableRow>
              )}
              {products.map((p) => (
                <TableRow key={p.productName}>
                  <TableCell className="font-medium text-foreground">{p.productName}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {p.quantitySold}
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground">
                    {formatCurrency(p.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
