import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const fontHeading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// `||` (not `??`) so an env var that's set-but-empty on the host still falls back.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shree Meenakshi Sweets & Savouries | Order Online",
    template: "%s | Shree Meenakshi Sweets & Savouries",
  },
  description:
    "Order authentic Indian sweets and savouries online from Shree Meenakshi Sweets & Savouries — traditional recipes, premium ingredients, delivered fresh nationwide.",
  keywords: [
    "Shree Meenakshi Sweets",
    "Indian sweets online",
    "order mithai online",
    "savouries online India",
    "Vijayawada sweets shop",
  ],
  openGraph: {
    title: "Shree Meenakshi Sweets & Savouries",
    description:
      "Order authentic Indian sweets and savouries online — traditional recipes, premium ingredients, delivered fresh nationwide.",
    url: siteUrl,
    siteName: "Shree Meenakshi Sweets & Savouries",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Meenakshi Sweets & Savouries",
    description:
      "Order authentic Indian sweets and savouries online — traditional recipes, premium ingredients, delivered fresh nationwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={150}>
          {children}
          <Toaster richColors closeButton position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
