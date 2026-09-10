import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy Policy" };

const EFFECTIVE_DATE = "10 September 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        <p>
          {BUSINESS.legalName}, trading as {BUSINESS.tradeName} (&quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;), respects your privacy. This policy explains what information we
          collect, how we use it, and your choices.
        </p>

        <section>
          <h2>1. Information We Collect</h2>
          <ul>
            <li>Account details: name, email address, and phone number.</li>
            <li>Order details: delivery address, items ordered, and order history.</li>
            <li>
              Payment information: handled entirely by Razorpay — we never receive or store your
              card, UPI, or net-banking credentials.
            </li>
            <li>Communications: messages you send us via the contact form or email.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process and deliver your orders, and send order/delivery updates.</li>
            <li>To respond to enquiries sent via the contact form.</li>
            <li>To send GST-compliant invoices as required by Indian tax law.</li>
            <li>To improve our website and prevent fraud or abuse.</li>
          </ul>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We work with the following trusted service providers, who process data on our behalf:</p>
          <ul>
            <li><strong>Supabase</strong> — account authentication, database, and image hosting.</li>
            <li><strong>Razorpay</strong> — payment processing.</li>
            <li><strong>Resend</strong> — transactional emails (order updates, account emails).</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>
            We use essential cookies to keep you signed in and remember your cart. We do not use
            cookies for third-party advertising.
          </p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain order records as required for GST and accounting compliance under Indian
            law. You may request deletion of your account data at any time, subject to these
            legal retention requirements.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You may access, correct, or request deletion of your personal information by
            contacting us. You can also update most account details directly from your account
            page.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            We use industry-standard measures — including encrypted connections and row-level
            database security — to protect your information.
          </p>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>This website is not directed at children under 18, and we do not knowingly collect their data.</p>
        </section>

        <section>
          <h2>9. Grievance Officer</h2>
          <p>
            For any privacy concerns or grievances, contact us at{" "}
            <a href={`mailto:${BUSINESS.email}`} className="text-primary underline underline-offset-2">
              {BUSINESS.email}
            </a>{" "}
            or {BUSINESS.phone}. We will respond within a reasonable timeframe as required by
            applicable Indian law.
          </p>
        </section>

        <p className="text-xs text-muted-foreground/70">
          We may update this Privacy Policy from time to time; the &quot;Effective&quot; date
          above reflects the latest revision.
        </p>
      </div>
    </div>
  );
}
