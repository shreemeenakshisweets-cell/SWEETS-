import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { FacebookGlyph, InstagramGlyph, WhatsAppGlyph } from "@/components/icons/social";
import { BUSINESS } from "@/lib/business";

const columns = [
  {
    heading: "Shop",
    links: [
      { href: "/menu", label: "All Products" },
      { href: "/menu?category=sweets", label: "Sweets" },
      { href: "/menu?category=savouries", label: "Savouries" },
      { href: "/menu?category=seasonal-specials", label: "Seasonal Specials" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/orders/track", label: "Order History & Tracking" },
      { href: "/cart", label: "Your Cart" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Traditional Indian sweets and savouries, made fresh with premium
              ingredients and delivered nationwide.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {BUSINESS.address}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                {BUSINESS.hours}
              </span>
              <a
                href={`tel:${BUSINESS.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Phone className="size-4 shrink-0" /> {BUSINESS.phone}
              </a>
              <a
                href={`https://wa.me/${BUSINESS.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <WhatsAppGlyph className="size-4 shrink-0" /> Chat on WhatsApp
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="size-4 shrink-0" /> {BUSINESS.email}
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
              >
                <FacebookGlyph className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
              >
                <InstagramGlyph className="size-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Shree Meenakshi Sweets & Savouries.
            All rights reserved.
          </p>
          <p>FSSAI Lic. No. {BUSINESS.fssai} &nbsp;&middot;&nbsp; GSTIN {BUSINESS.gstin}</p>
        </div>
      </div>
    </footer>
  );
}
