import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Terms of Service" };

const EFFECTIVE_DATE = "10 September 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the website operated by{" "}
          {BUSINESS.legalName}, trading as {BUSINESS.tradeName} (&quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;), FSSAI Lic. No. {BUSINESS.fssai}, GSTIN {BUSINESS.gstin}. By placing an
          order or otherwise using this website, you agree to these Terms.
        </p>

        <section>
          <h2>1. Orders &amp; Acceptance</h2>
          <p>
            Placing an order is an offer to purchase, which we may accept or decline (for example
            if an item is out of stock, or we suspect fraud). An order is confirmed only once
            payment is successfully verified and you receive a confirmation email.
          </p>
        </section>

        <section>
          <h2>2. Pricing &amp; Payments</h2>
          <p>
            All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST unless
            stated otherwise. Payments are processed securely through Razorpay; we do not store
            your card, UPI, or net-banking credentials on our servers.
          </p>
        </section>

        <section>
          <h2>3. Shipping &amp; Delivery</h2>
          <p>
            We aim to dispatch and deliver orders within the timeframe shown at checkout. Since
            our products are freshly made food items, delivery timelines may vary based on your
            location, weather, and courier availability. Please ensure someone is available to
            receive perishable orders on the expected delivery day.
          </p>
        </section>

        <section>
          <h2>4. Cancellations, Returns &amp; Refunds</h2>
          <ul>
            <li>
              As our products are perishable food items made fresh to order, cancellations are
              only accepted before an order enters preparation. Contact us as soon as possible if
              you need to cancel.
            </li>
            <li>
              If you receive a damaged, incorrect, or spoiled item, contact us within 24 hours of
              delivery with photos — we will offer a replacement or refund at our discretion.
            </li>
            <li>
              Approved refunds are credited back to the original payment method via Razorpay,
              typically within 5–7 business days.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Accounts</h2>
          <p>
            You are responsible for keeping your account credentials confidential and for all
            activity under your account. Notify us immediately of any unauthorised use.
          </p>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website — including text, recipes, photography, and branding — is
            the property of {BUSINESS.tradeName} and may not be reproduced without permission.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            To the extent permitted by law, we are not liable for indirect or consequential
            losses arising from use of this website or delayed/failed delivery due to
            circumstances outside our reasonable control.
          </p>
        </section>

        <section>
          <h2>8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India, and any disputes are subject to the
            exclusive jurisdiction of the courts in Vijayawada, Andhra Pradesh.
          </p>
        </section>

        <section>
          <h2>9. Contact &amp; Grievances</h2>
          <p>
            For any questions or complaints regarding these Terms, reach us at{" "}
            <a href={`mailto:${BUSINESS.email}`} className="text-primary underline underline-offset-2">
              {BUSINESS.email}
            </a>{" "}
            or {BUSINESS.phone}.
          </p>
        </section>

        <p className="text-xs text-muted-foreground/70">
          We may update these Terms from time to time; the &quot;Effective&quot; date above
          reflects the latest revision.
        </p>
      </div>
    </div>
  );
}
