import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User as AppUser } from "@/generated/prisma/client";

/**
 * Returns the signed-in Supabase user joined with their app profile row,
 * provisioning the profile on first access (no DB trigger required).
 * Returns null when signed out.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email ?? undefined,
    },
    create: {
      id: authUser.id,
      email: authUser.email ?? "",
      fullName:
        (authUser.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
      phone: authUser.phone ?? null,
    },
  });
}

/** Redirects to /login when signed out. Use in Server Components/Actions. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects non-admins away from admin-only routes. */
export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
