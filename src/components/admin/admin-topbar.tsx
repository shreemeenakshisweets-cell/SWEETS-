"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:hidden">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebar />
        </SheetContent>
      </Sheet>
      <h1 className="flex-1 font-heading text-lg font-semibold text-foreground">Admin</h1>
    </header>
  );
}
