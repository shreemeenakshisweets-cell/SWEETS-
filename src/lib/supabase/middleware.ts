import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/checkout", "/orders"];
const ADMIN_PREFIX = "/admin";

/**
 * Refreshes the Supabase auth session on every request and applies
 * optimistic route protection. Full authorization checks still belong in
 * each Server Component / Route Handler — this is a fast, non-authoritative
 * redirect layer only (see Next.js Proxy guidance).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);

  if (!user && (needsAuth || needsAdmin)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: return supabaseResponse as-is so the refreshed auth cookies
  // reach the browser. Copy it (don't recreate NextResponse) if you need to
  // add more logic here.
  return supabaseResponse;
}
