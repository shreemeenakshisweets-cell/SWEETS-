"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { navLinks } from "@/components/layout/nav-links";
import { CartSheet } from "@/components/cart/cart-sheet";
import { signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import type { User as AppUser } from "@/generated/prisma/client";

export function SiteHeader({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [query, setQuery] = React.useState("");

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 8));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/menu?q=${encodeURIComponent(query.trim())}` : "/menu");
  }

  const initials = (user?.fullName ?? user?.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70"
          : "border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href.split("?")[0];
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:text-primary",
                  active ? "text-primary" : "text-foreground/80"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sweets, savouries..."
            className="pl-9"
            aria-label="Search products"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <CartSheet />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="rounded-full" />}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">
                  {user.fullName ?? user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/account" />}>
                  <UserIcon /> My Account
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    <LayoutDashboard /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <DropdownMenuItem render={<button type="submit" className="w-full" />}>
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Sign in
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="px-4 pt-4">
                <Logo />
              </SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                    >
                      My Account
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <Button
                    render={<Link href="/login" />}
                    nativeButton={false}
                    className="w-full"
                  >
                    Sign in
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
