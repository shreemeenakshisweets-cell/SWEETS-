import Link from "next/link";
import type { Metadata } from "next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/currency";
import { getAdminCustomers } from "@/lib/data/admin/customers";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} customers</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {customer.fullName ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {customer.orderCount}
                </TableCell>
                <TableCell className="tabular-nums text-foreground">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
