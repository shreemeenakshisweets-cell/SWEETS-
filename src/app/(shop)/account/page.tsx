import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList, Heart, MapPin, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { requireUser } from "@/lib/auth";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Account" };

const links = [
  {
    icon: ClipboardList,
    label: "Order History",
    description: "Track and review past orders",
    href: "/orders/track",
  },
  {
    icon: MapPin,
    label: "Saved Addresses",
    description: "Managed inline during checkout for now",
    href: null,
  },
  {
    icon: Heart,
    label: "Wishlist",
    description: "Products you've saved for later",
    href: null,
  },
];

export default async function AccountPage() {
  const user = await requireUser();
  const initials = (user.fullName ?? user.email).slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary text-lg text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {user.fullName ?? "Your Account"}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {links.map(({ icon: Icon, label, description, href }) => {
          const content = (
            <>
              <Icon className="size-5 text-primary" />
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
              {!href && (
                <span className="mt-1 w-fit rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                  Coming soon
                </span>
              )}
            </>
          );

          return href ? (
            <Link
              key={label}
              href={href}
              className="flex flex-col gap-2 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40"
            >
              {content}
            </Link>
          ) : (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-5"
            >
              {content}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-5">
        <UserIcon className="size-5 text-primary" />
        <p className="flex-1 text-sm text-muted-foreground">
          Profile editing and a dedicated address book are coming in a later
          phase — addresses can be added directly during checkout for now.
        </p>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
