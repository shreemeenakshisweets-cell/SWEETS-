import { Mail, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/business";

/** Slim contact strip above the header — business name plus a fast way to reach us. */
export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-6 gap-y-1 px-4 py-1.5 text-center text-[0.7rem] font-medium sm:text-xs">
        <span className="hidden tracking-wide sm:inline">{BUSINESS.tradeName}</span>
        <a
          href={`tel:${BUSINESS.phone.replace(/\s+/g, "")}`}
          className="flex items-center gap-1.5 hover:underline"
        >
          <Phone className="size-3.5" /> {BUSINESS.phone}
        </a>
        <a
          href={`mailto:${BUSINESS.email}`}
          className="hidden items-center gap-1.5 hover:underline sm:flex"
        >
          <Mail className="size-3.5" /> {BUSINESS.email}
        </a>
      </div>
    </div>
  );
}
