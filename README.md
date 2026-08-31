# Shree Meenakshi Sweets & Savouries — Online Ordering Platform

A premium food ordering platform for **Shree Meenakshi Sweets & Savouries**
(FSSAI Lic. 20126121000588, GSTIN 37ARPPB5539B2ZU), built with Next.js, Prisma,
Supabase, and Razorpay. This repository is being delivered in phases; this
README always reflects what's actually implemented, not the full end-state
spec.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui (Base UI primitives), Framer Motion
- **Data:** PostgreSQL via Prisma ORM 7 (driver adapters, `@prisma/adapter-pg`)
- **Auth/DB/Storage:** Supabase
- **Payments:** Razorpay (Phase 2)
- **Images:** Cloudinary (Phase 3)
- **Email:** Resend (Phase 3)
- **Deployment target:** Vercel

## ⚠️ Windows filesystem note

This project **must live on an NTFS volume**. It cannot be built on an exFAT
or FAT32 drive — Next.js's build tooling (Turbopack and webpack) both rely on
filesystem junction points/symlinks that exFAT does not support at all, and
builds fail with `TurbopackInternalError` / `EISDIR` errors. If you're
copying this project from an external exFAT/FAT32 drive, copy it onto your
system drive (`C:\`, or wherever Windows is installed) first.

## Getting started

```bash
npm install
npx prisma generate
cp .env.example .env   # then fill in real values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Supabase → Project Settings → Database → Connection string. Use the pooled (port 6543) URL for `DATABASE_URL` and the direct (port 5432) URL for `DIRECT_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary Dashboard (Phase 3) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Resend Dashboard (Phase 3) |

For Supabase Auth, also enable:
- **Email** provider (used for password login, OTP login, and password reset)
- **Google** OAuth provider, with redirect URL `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback` for local dev)

### Database migrations & seeding

Once `DATABASE_URL` points at a real Supabase Postgres instance:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

`migrate dev` creates the tables described in `prisma/schema.prisma`.
`db seed` (or `npx tsx prisma/seed.ts`) loads `prisma/seed.ts`, which pushes
the demo catalog from `src/lib/data/catalog.ts` into real
`Category`/`Product`/`ProductVariant` rows, keyed by slug/SKU. **This is
required before checkout will work** — the checkout API validates every
cart item against the database by SKU and refuses anything it can't find,
so an unseeded database means every checkout attempt fails with "item no
longer available".

### Razorpay setup

1. Get test-mode API keys from the Razorpay Dashboard → Settings → API Keys.
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
3. For the webhook fallback (optional but recommended): Dashboard → Webhooks
   → add `https://<your-domain>/api/webhooks/razorpay`, subscribe to
   `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET`
   to the secret shown there. Locally, use the Razorpay CLI or a tunnel
   (e.g. `ngrok`) to receive webhooks — the client-side verify path
   (`/api/checkout/verify`) works without it.

## What's implemented (Phase 1 — Foundation)

- Project scaffold: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui (Base UI)
  + Framer Motion, configured and building cleanly.
- Brand theme: full light/dark token set sampled from the business's actual
  logo (antique gold `#7a6118` / cream `#fdfbf5` in light mode, gold
  `#d8b84a` on near-black `#17130d` in dark mode), wired through
  `next-themes` with a working toggle.
- Full Prisma schema (`prisma/schema.prisma`) covering Users, Addresses,
  Categories, Products, ProductVariants, Orders, OrderItems,
  OrderStatusHistory, Payments, Coupons, Invoices, Reviews, Notifications,
  WishlistItem, CouponRedemption — with the Pending → Confirmed → Preparing
  → Packed → Out For Delivery → Delivered status flow as an enum.
- Supabase Auth scaffolding: browser/server/admin clients, session-refresh
  proxy (Next 16 renamed `middleware.ts` to `proxy.ts`), and a
  `getCurrentUser()`/`requireUser()`/`requireAdmin()` helper that
  auto-provisions the app's `User` row from the Supabase auth user.
- Responsive header/footer, mobile nav, cart drawer, theme toggle.
- **Home page:** hero, shop-by-category, featured products, offers/promotions,
  testimonials, CTA — all Framer Motion–animated, all real business copy (no
  fabricated history/claims).
- **Menu page:** search, category filter, sort (popularity/rating/price),
  responsive product grid, empty state — filter state syncs to the URL.
- **Product detail page:** gallery, variant/weight selector, quantity
  stepper, related products, breadcrumbs.
- **Cart:** Zustand store with `localStorage` persistence, quantity
  controls, coupon application (`WELCOME10`, `SWEET50` — static demo table),
  tax (5% GST) and delivery-fee (₹49, free above ₹999) calculation.
- **Auth pages:** email/password login & signup, Google OAuth button,
  email OTP login (request code → verify code), password reset
  (request link → set new password), all backed by real Supabase Auth server
  actions (`src/app/(auth)/actions.ts`) with Zod validation.
- Demo catalog: 22 realistic products across 6 categories (sweets, dry-fruit
  sweets, savouries, gift boxes, beverages, bakery), with weight variants and
  pricing modeled on real Indian mithai shop pricing.

## What's implemented (Phase 2 — Checkout, Payments, Orders)

- `prisma/seed.ts`: seeds real `Category`/`Product`/`ProductVariant` rows
  from the demo catalog, keyed by slug/SKU, so checkout has real data to
  validate against.
- **Checkout page** (`/checkout`, signed-in only): saved-address selection,
  an "Add new address" dialog (real `Address` rows via
  `src/app/(shop)/checkout/actions.ts`), delivery instructions, order
  review, and price summary.
- **`POST /api/checkout`**: re-validates every cart item against the
  database by SKU (never trusts client-sent prices/totals), checks stock,
  re-evaluates the coupon server-side, recomputes totals with the same
  pricing function the cart UI uses (`src/lib/pricing.ts`), creates a
  `PENDING` `Order` + `OrderItem`s + a `PENDING` `Payment`, then creates a
  matching Razorpay order.
- **`POST /api/checkout/verify`**: verifies the Razorpay payment signature
  server-side (HMAC-SHA256, constant-time compare), cross-checks the
  payment actually belongs to the claimed order, then marks the order
  `CONFIRMED`, records the `OrderStatusHistory` entry, and decrements
  variant stock (via a conditional `stock >= quantity` update, so it can't
  go negative under concurrent orders).
- **`POST /api/webhooks/razorpay`**: signature-verified server-to-server
  fallback for `payment.captured`/`payment.failed`, idempotent against the
  client-side verify path.
- **Order confirmation page** (`/orders/[orderNumber]/confirmation`) and
  **order tracking** (`/orders/track` for the list,
  `/orders/[orderNumber]/track` for the full timeline), both driven by
  `OrderStatusHistory` via `src/components/orders/order-status-timeline.tsx`.
- `/account` now links to the real order history instead of a "coming soon"
  placeholder.
- **Coupons are DB-backed** (`src/lib/data/coupon-validation.ts`), used by
  both the cart's live preview (`POST /api/coupons/apply`) and the checkout
  API — enforcing `isActive`, date window, `minOrderValue`, `usageLimit`,
  and `perUserLimit` (via `CouponRedemption`). A coupon is only marked used
  once payment is actually confirmed, never at order creation.
- **GST invoices** (`src/lib/data/admin/invoices.ts`): a sequential,
  financial-year-scoped invoice number (`SM/2026-27/00001`) and `Invoice`
  row are generated automatically the moment an order is confirmed (both in
  `/api/checkout/verify` and the webhook path). Customers can view/print
  theirs at `/orders/[orderNumber]/invoice`; browser print-to-PDF is the
  "download" mechanism (no server-side PDF rendering dependency).

## What's implemented (Phase 3a — Admin Panel)

Everything under `/admin`, guarded by `requireAdmin()` (redirects
non-admins to `/`, signed-out users to `/login`):

- **Dashboard** (`/admin`): revenue this month (with vs.-last-month %
  change), orders this month/today, pending-order count, total customers, a
  14-day revenue chart (`src/components/admin/sales-chart.tsx`, Recharts via
  shadcn's chart wrapper), top 5 products, and a recent-orders feed.
- **Products** (`/admin/products`): table with price range/stock/status,
  show-hide toggle, delete; a shared create/edit form
  (`src/components/admin/product-form.tsx`) with a dynamic variant list
  (add/remove weight tiers, price, compare-at price, SKU, stock, default
  flag) via `useFieldArray`.
- **Categories** (`/admin/categories`): table + add/edit dialog.
- **Orders** (`/admin/orders`): status-filterable, paginated table; a detail
  page (`/admin/orders/[id]`) with customer/address/items/payments, a
  status-update control that writes to `OrderStatusHistory`, and a link to
  the printable invoice once one exists.
- **Customers** (`/admin/customers`): table with order count and lifetime
  spend; a detail page with saved addresses and full order history.
- **Coupons** (`/admin/coupons`): table + add/edit dialog covering every
  `Coupon` field (type, value, min order, max discount, usage/per-user
  limits, active window) — these are the same coupons checkout validates
  against, so creating one here makes it usable immediately.
- **Reports** (`/admin/reports`): sales grouped daily/weekly/monthly, plus a
  product-performance table (units sold, revenue) — both real Prisma
  aggregations, not static data.

### Making yourself an admin

There's no self-serve "become admin" flow (by design). After signing up
once so your `User` row exists, promote it directly:

```bash
npx prisma studio
# Users table -> find your row -> set role to ADMIN
```

or via SQL: `UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';`

## What's next

- **Phase 3b:** Resend email notifications (order placed, payment success,
  confirmed, out for delivery, delivered — SMS/WhatsApp-ready architecture
  per the original spec, not actual SMS/WhatsApp sending), Cloudinary
  product image uploads (the admin product form currently takes raw image
  URLs), wishlist persistence to the database (currently a decorative
  client-only toggle), a dedicated address-book page (addresses are
  currently manageable only inline during checkout), and emailing the
  invoice automatically on payment success.

## Replacing placeholder content

All product/category/testimonial data lives in `src/lib/data/catalog.ts` as
static TypeScript objects — this was a deliberate Phase 1 choice so the UI
could be built and reviewed before wiring a live database. Product images
currently come from `placehold.co` (branded-color placeholders, not real
photography) via `src/lib/data/placeholder-image.ts`.

To go live:
1. Run `npx prisma db seed` (loads the demo catalog into the database), then
   use `/admin/products` and `/admin/categories` to edit or replace it —
   no code changes needed from here on.
2. Upload real product photography somewhere reachable (Cloudinary
   integration is still pending — see "What's next") and paste the URLs
   into the admin product form.
3. The storefront (`/`, `/menu`) still reads from the static
   `src/lib/data/catalog.ts` module rather than the database — switching
   those pages to Prisma queries is the remaining piece to make admin edits
   actually show up on the live site.

## Project structure

```
src/
  app/
    (shop)/            customer-facing pages (home, menu, cart, checkout, orders, account)
    (auth)/            login, signup, OTP verify, password reset
    auth/callback/     Supabase OAuth/OTP/recovery redirect handler
    admin/             admin panel — dashboard, products, categories, orders, customers, coupons, reports
    api/checkout/      order creation + payment verification routes
    api/coupons/       live coupon-apply preview for the cart
    api/webhooks/      Razorpay webhook handler
  components/
    layout/            header, footer, nav, logo, theme toggle
    home/              hero, category grid, featured products, promotions, testimonials, CTA
    menu/              menu browser (search/filter/sort)
    product/           product card, product detail, rating stars, tag badges
    cart/              cart drawer (sheet) and full cart page
    checkout/          checkout view, address form/dialog
    orders/            order status badge + timeline + printable invoice view
    admin/             sidebar/topbar, stat cards, sales chart, product/category/coupon forms, order status control
    auth/              login/signup/OTP/reset-password forms, Google button
    ui/                shadcn/ui primitives (Base UI–based)
  lib/
    data/              static demo catalog, orders queries, coupon validation, placeholder image helper
    data/admin/        admin-only Prisma queries (dashboard, products, orders, customers, coupons, reports, invoices)
    store/             Zustand cart store
    supabase/          browser/server/admin Supabase clients + proxy session helper
    validation/        Zod schemas (customer-facing + admin)
    prisma.ts          Prisma client singleton (driver adapter pattern)
    pricing.ts         shared tax/delivery/total math (cart UI + checkout API)
    razorpay.ts        Razorpay SDK client + payment signature verification
    order-number.ts    human-readable order number generator
    business.ts        shared business/legal constants (GSTIN, FSSAI, address)
    auth.ts            getCurrentUser/requireUser/requireAdmin
  types/               catalog domain types, Razorpay checkout.js window typing
prisma/
  schema.prisma        full data model
  seed.ts              seeds Category/Product/ProductVariant/Coupon from the demo catalog
```

## Known environment notes

- Prisma 7's `@prisma/config` package currently has a high-severity
  transitive advisory in `deepmerge-ts`; it's a dev-only, build-time
  dependency (not present in the deployed runtime), and the only fix
  available today downgrades Prisma to 6.x, so it's left as-is pending an
  upstream patch.
- `nativeButton={false}` is set on every shadcn `Button` that renders as a
  `<Link>` via the `render` prop — Base UI's Button defaults to expecting a
  real `<button>` element and warns otherwise.
- **Vercel env var changes:** clicking "Redeploy" on an *existing* deployment
  can reuse that deployment's original environment variable snapshot rather
  than picking up current Project Settings values. After changing env vars,
  trigger a genuinely new deployment (push a commit) rather than redeploying
  an old one, or the app can keep running against stale/missing values even
  though the dashboard shows the new ones saved.
