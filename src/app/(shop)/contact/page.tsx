import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${BUSINESS.tradeName} — questions about an order, bulk/festive orders, or anything else.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Contact Us</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Questions about an order, bulk or festive orders, or anything else — we&apos;d love to
        hear from you.
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-5">
        <div className="flex flex-col gap-4 sm:col-span-2">
          <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Address</p>
              <p className="text-sm text-muted-foreground">{BUSINESS.address}</p>
            </div>
          </div>
          <a
            href={`tel:${BUSINESS.phone.replace(/\s+/g, "")}`}
            className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:border-primary/40"
          >
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">{BUSINESS.phone}</p>
            </div>
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:border-primary/40"
          >
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{BUSINESS.email}</p>
            </div>
          </a>
        </div>

        <div className="sm:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
