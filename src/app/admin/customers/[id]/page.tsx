import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { getAdminCustomerById } from "@/lib/data/admin/customers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  return { title: customer?.fullName ?? customer?.email ?? "Customer" };
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  const initials = (customer.fullName ?? customer.email).slice(0, 1).toUpperCase();
  const totalSpent = customer.orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {customer.fullName ?? "Unnamed Customer"}
          </h1>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="mt-1 font-heading text-xl font-semibold text-foreground">
            {customer.orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="mt-1 font-heading text-xl font-semibold text-foreground">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="mt-1 font-heading text-xl font-semibold text-foreground">
            {customer.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </p>
        </div>
      </div>

      {customer.addresses.length > 0 && (
        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
            Addresses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium text-foreground">{a.fullName}</p>
                <p className="text-muted-foreground">
                  {a.line1}, {a.city}, {a.state} {a.postalCode}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border p-5">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Order History
        </h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-3 text-sm hover:text-primary"
              >
                <div>
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
                    {order.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="tabular-nums font-medium text-foreground">
                    {formatCurrency(Number(order.total))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
