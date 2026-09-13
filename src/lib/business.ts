export const BUSINESS = {
  legalName: "Bandikatla Karthika",
  tradeName: "Shree Meenakshi Sweets and Savouries",
  gstin: "37ARPPB5539B2ZU",
  fssai: "20126121000588",
  address:
    "Plot No 60, Sri Lakshmi Venkateswara Gardens, Tadigadapa, Penamaluru, Vijayawada, Krishna, Andhra Pradesh - 521134",
  phone: "+91 80080 89975",
  // Digits only, country code, no "+" or spaces (the format wa.me links
  // require). Same number as `phone` unless a separate WhatsApp Business
  // number is set up later.
  whatsapp: "918008089975",
  email: "customercare@shreemeenakshisweets.com",
  hours: "Mon – Sun: 9:00 AM – 9:00 PM",
  // Leave unset until real pages exist — the footer hides each icon rather
  // than link out to "#".
  facebook: undefined as string | undefined,
  instagram: undefined as string | undefined,
} as const;
