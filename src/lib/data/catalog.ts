import type { Category, Product, Promotion, Testimonial } from "@/types/catalog";
import { placeholderImage } from "@/lib/data/placeholder-image";

export const categories: Category[] = [
  {
    id: "cat-sweets",
    slug: "sweets",
    name: "Traditional Sweets",
    description: "Time-honoured mithai made fresh in small batches, every day.",
    imageUrl: placeholderImage("Traditional Sweets", { bg: "f3e7c3", fg: "4a3b0e" }),
  },
  {
    id: "cat-dry-fruit",
    slug: "dry-fruit-sweets",
    name: "Dry Fruit Specials",
    description: "Premium cashew, almond and pistachio sweets for gifting or indulging.",
    imageUrl: placeholderImage("Dry Fruit Specials", { bg: "e7dec8", fg: "4a3b0e" }),
  },
  {
    id: "cat-savouries",
    slug: "savouries",
    name: "Savouries & Namkeen",
    description: "Crunchy, spiced snacks — the perfect companion to evening chai.",
    imageUrl: placeholderImage("Savouries & Namkeen", { bg: "f5e6af", fg: "4a3b0e" }),
  },
  {
    id: "cat-gift-boxes",
    slug: "gift-boxes",
    name: "Festive Gift Boxes",
    description: "Curated assortments boxed for festivals, weddings and celebrations.",
    imageUrl: placeholderImage("Festive Gift Boxes", { bg: "b3401f", fg: "fff7ee" }),
  },
  {
    id: "cat-beverages",
    slug: "beverages",
    name: "Beverages",
    description: "Filter coffee, masala chai and traditional drink mixes.",
    imageUrl: placeholderImage("Beverages", { bg: "6b5b2a", fg: "f8edb7" }),
  },
  {
    id: "cat-bakery",
    slug: "bakery",
    name: "Bakery & Prepared Foods",
    description: "Fresh-batch kesari, laddus and other prepared favourites.",
    imageUrl: placeholderImage("Bakery & Prepared Foods", { bg: "f3e7c3", fg: "4a3b0e" }),
  },
];

function variant(
  label: string,
  price: number,
  sku: string,
  opts: Partial<Product["variants"][number]> = {}
) {
  return {
    id: sku,
    label,
    price,
    sku,
    stock: 40,
    ...opts,
  };
}

export const products: Product[] = [
  // --- Traditional Sweets -----------------------------------------------
  {
    id: "p-mysore-pak",
    slug: "mysore-pak",
    name: "Mysore Pak",
    categorySlug: "sweets",
    shortDescription: "Melt-in-the-mouth gram flour and ghee classic.",
    description:
      "Our signature Mysore Pak is made the traditional way — pure ghee, roasted gram flour and sugar syrup, hand-poured and cut while still warm for that iconic porous, melt-in-the-mouth texture.",
    images: [placeholderImage("Mysore Pak")],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller"],
    ratingAverage: 4.8,
    ratingCount: 214,
    variants: [
      variant("250 g", 320, "SM-MYSP-250", { compareAtPrice: 360, isDefault: true }),
      variant("500 g", 610, "SM-MYSP-500", { compareAtPrice: 690 }),
    ],
  },
  {
    id: "p-motichoor-laddu",
    slug: "motichoor-laddu",
    name: "Motichoor Laddu",
    categorySlug: "sweets",
    shortDescription: "Tiny gram-flour pearls bound in cardamom syrup.",
    description:
      "Delicate boondi pearls simmered in cardamom-scented sugar syrup and shaped into soft, fragrant laddus — a festival favourite.",
    images: [placeholderImage("Motichoor Laddu")],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller"],
    ratingAverage: 4.7,
    ratingCount: 189,
    variants: [
      variant("250 g", 280, "SM-MOTL-250", { isDefault: true }),
      variant("500 g", 540, "SM-MOTL-500"),
    ],
  },
  {
    id: "p-gulab-jamun",
    slug: "gulab-jamun",
    name: "Gulab Jamun",
    categorySlug: "sweets",
    shortDescription: "Soft khoya dumplings soaked in rose-cardamom syrup.",
    description:
      "Golden-fried khoya dumplings, soft all the way through, soaked in a fragrant rose and cardamom sugar syrup.",
    images: [placeholderImage("Gulab Jamun")],
    isVeg: true,
    tags: [],
    ratingAverage: 4.6,
    ratingCount: 301,
    variants: [
      variant("6 pieces", 220, "SM-GULJ-006", { isDefault: true }),
      variant("12 pieces", 420, "SM-GULJ-012"),
    ],
  },
  {
    id: "p-doodh-peda",
    slug: "doodh-peda",
    name: "Doodh Peda",
    categorySlug: "sweets",
    shortDescription: "Rich reduced-milk fudge, lightly sweetened.",
    description:
      "Slow-reduced full-cream milk, sweetened just right and finished with a hint of cardamom — a lighter, milkier take on classic peda.",
    images: [placeholderImage("Doodh Peda")],
    isVeg: true,
    tags: ["new"],
    ratingAverage: 4.5,
    ratingCount: 97,
    variants: [
      variant("250 g", 300, "SM-PEDA-250", { isDefault: true }),
      variant("500 g", 570, "SM-PEDA-500"),
    ],
  },
  {
    id: "p-rasgulla",
    slug: "rasgulla",
    name: "Rasgulla",
    categorySlug: "sweets",
    shortDescription: "Spongy cottage-cheese balls in light sugar syrup.",
    description:
      "Soft, spongy chhena balls cooked in a light sugar syrup — served chilled for the best texture.",
    images: [placeholderImage("Rasgulla")],
    isVeg: true,
    tags: ["sugar-free"],
    ratingAverage: 4.4,
    ratingCount: 88,
    variants: [variant("6 pieces (syrup jar)", 210, "SM-RASG-006", { isDefault: true })],
  },
  {
    id: "p-gajar-halwa",
    slug: "gajar-halwa",
    name: "Gajar Ka Halwa",
    categorySlug: "sweets",
    shortDescription: "Slow-cooked carrot halwa with ghee and khoya.",
    description:
      "Fresh carrots slow-cooked in ghee and milk, finished with khoya and a scatter of roasted nuts.",
    images: [placeholderImage("Gajar Halwa")],
    isVeg: true,
    tags: ["limited"],
    ratingAverage: 4.6,
    ratingCount: 64,
    variants: [
      variant("250 g", 260, "SM-GAJH-250", { isDefault: true }),
      variant("500 g", 490, "SM-GAJH-500"),
    ],
  },

  // --- Dry Fruit Specials --------------------------------------------------
  {
    id: "p-kaju-katli",
    slug: "kaju-katli",
    name: "Kaju Katli",
    categorySlug: "dry-fruit-sweets",
    shortDescription: "Silver-leaf topped cashew diamonds.",
    description:
      "Premium whole cashews ground into a smooth dough with sugar and ghee, rolled thin and topped with edible silver leaf.",
    images: [placeholderImage("Kaju Katli")],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller"],
    ratingAverage: 4.9,
    ratingCount: 342,
    variants: [
      variant("250 g", 460, "SM-KAJK-250", { compareAtPrice: 520, isDefault: true }),
      variant("500 g", 890, "SM-KAJK-500", { compareAtPrice: 1000 }),
    ],
  },
  {
    id: "p-badam-burfi",
    slug: "badam-burfi",
    name: "Badam Burfi",
    categorySlug: "dry-fruit-sweets",
    shortDescription: "Rich almond fudge squares.",
    description:
      "Blanched almonds ground fresh and cooked down with sugar and ghee into rich, dense burfi squares.",
    images: [placeholderImage("Badam Burfi")],
    isVeg: true,
    tags: ["festive"],
    ratingAverage: 4.7,
    ratingCount: 132,
    variants: [
      variant("250 g", 480, "SM-BADB-250", { isDefault: true }),
      variant("500 g", 920, "SM-BADB-500"),
    ],
  },
  {
    id: "p-dry-fruit-laddu",
    slug: "dry-fruit-laddu",
    name: "Dry Fruit Laddu",
    categorySlug: "dry-fruit-sweets",
    shortDescription: "Sugar-free laddu packed with nuts and dates.",
    description:
      "A guilt-free favourite — dates, almonds, cashews and pistachios bound together with no added sugar.",
    images: [placeholderImage("Dry Fruit Laddu")],
    isVeg: true,
    tags: ["sugar-free", "bestseller"],
    ratingAverage: 4.8,
    ratingCount: 176,
    variants: [
      variant("250 g", 440, "SM-DFLD-250", { isDefault: true }),
      variant("500 g", 850, "SM-DFLD-500"),
    ],
  },
  {
    id: "p-anjeer-roll",
    slug: "anjeer-roll",
    name: "Anjeer Roll",
    categorySlug: "dry-fruit-sweets",
    shortDescription: "Fig and nut rolls, naturally sweet.",
    description:
      "Fresh figs blended with roasted nuts and rolled into bite-sized pieces — naturally sweet with no added sugar.",
    images: [placeholderImage("Anjeer Roll")],
    isVeg: true,
    tags: ["sugar-free", "new"],
    ratingAverage: 4.6,
    ratingCount: 58,
    variants: [variant("250 g", 520, "SM-ANJR-250", { isDefault: true })],
  },

  // --- Savouries & Namkeen -------------------------------------------------
  {
    id: "p-andhra-mixture",
    slug: "andhra-mixture",
    name: "Andhra Mixture",
    categorySlug: "savouries",
    shortDescription: "Spiced sev, peanut and lentil mix.",
    description:
      "A fiery, crunchy blend of sev, fried lentils, peanuts and curry leaves — our most-loved evening snack.",
    images: [placeholderImage("Andhra Mixture", { bg: "f5e6af" })],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller", "spicy"],
    ratingAverage: 4.7,
    ratingCount: 268,
    variants: [
      variant("200 g", 160, "SM-ANDM-200", { isDefault: true }),
      variant("400 g", 300, "SM-ANDM-400"),
    ],
  },
  {
    id: "p-murukku",
    slug: "murukku",
    name: "Murukku",
    categorySlug: "savouries",
    shortDescription: "Crisp spiral rice-flour crackers.",
    description:
      "Traditional rice-flour and urad dal spirals, deep fried to a satisfying crunch with a hint of sesame.",
    images: [placeholderImage("Murukku", { bg: "f5e6af" })],
    isVeg: true,
    tags: [],
    ratingAverage: 4.5,
    ratingCount: 121,
    variants: [
      variant("200 g", 150, "SM-MURK-200", { isDefault: true }),
      variant("400 g", 280, "SM-MURK-400"),
    ],
  },
  {
    id: "p-masala-peanuts",
    slug: "masala-peanuts",
    name: "Masala Peanuts",
    categorySlug: "savouries",
    shortDescription: "Crunchy gram-flour coated peanuts.",
    description:
      "Peanuts coated in a spiced gram-flour batter and fried crisp — a bold, spicy bite in every handful.",
    images: [placeholderImage("Masala Peanuts", { bg: "f5e6af" })],
    isVeg: true,
    tags: ["spicy"],
    ratingAverage: 4.4,
    ratingCount: 94,
    variants: [
      variant("200 g", 140, "SM-MASP-200", { isDefault: true }),
      variant("400 g", 260, "SM-MASP-400"),
    ],
  },
  {
    id: "p-ribbon-pakoda",
    slug: "ribbon-pakoda",
    name: "Ribbon Pakoda",
    categorySlug: "savouries",
    shortDescription: "Thin, crisp ribbon-shaped namkeen.",
    description:
      "Gram flour ribbons pressed thin and fried to a light, delicate crunch, seasoned with chilli and sesame.",
    images: [placeholderImage("Ribbon Pakoda", { bg: "f5e6af" })],
    isVeg: true,
    tags: ["new"],
    ratingAverage: 4.6,
    ratingCount: 77,
    variants: [
      variant("200 g", 155, "SM-RIBP-200", { isDefault: true }),
      variant("400 g", 290, "SM-RIBP-400"),
    ],
  },

  // --- Festive Gift Boxes ---------------------------------------------------
  {
    id: "p-festive-assorted-box",
    slug: "festive-assorted-sweets-box",
    name: "Festive Assorted Sweets Box",
    categorySlug: "gift-boxes",
    shortDescription: "A curated box of six signature sweets.",
    description:
      "Our most popular gifting box — six signature sweets including Kaju Katli, Mysore Pak and Motichoor Laddu, beautifully packaged.",
    images: [placeholderImage("Festive Assorted Box", { bg: "b3401f", fg: "fff7ee" })],
    isVeg: true,
    isFeatured: true,
    tags: ["festive", "bestseller"],
    ratingAverage: 4.9,
    ratingCount: 156,
    variants: [
      variant("1 kg Box", 1450, "SM-GIFT-ASST-1KG", { compareAtPrice: 1650, isDefault: true }),
    ],
  },
  {
    id: "p-diwali-hamper",
    slug: "diwali-special-hamper",
    name: "Diwali Special Hamper",
    categorySlug: "gift-boxes",
    shortDescription: "Premium hamper with sweets, savouries and dry fruits.",
    description:
      "A generous festive hamper combining our best sweets, savouries and a dry-fruit selection — ready to gift.",
    images: [placeholderImage("Diwali Hamper", { bg: "b3401f", fg: "fff7ee" })],
    isVeg: true,
    tags: ["festive", "limited"],
    ratingAverage: 4.8,
    ratingCount: 62,
    variants: [
      variant("1.5 kg Hamper", 2199, "SM-GIFT-DIWA-1500", { compareAtPrice: 2499, isDefault: true }),
    ],
  },
  {
    id: "p-corporate-gift-box",
    slug: "corporate-gift-box",
    name: "Corporate Gift Box",
    categorySlug: "gift-boxes",
    shortDescription: "Elegant bulk gifting box for offices and events.",
    description:
      "A refined presentation box designed for corporate gifting, with a balanced mix of dry fruit sweets and savouries.",
    images: [placeholderImage("Corporate Gift Box", { bg: "b3401f", fg: "fff7ee" })],
    isVeg: true,
    tags: ["festive"],
    ratingAverage: 4.7,
    ratingCount: 41,
    variants: [variant("1 kg Box", 1899, "SM-GIFT-CORP-1KG", { isDefault: true })],
  },

  // --- Beverages -------------------------------------------------------------
  {
    id: "p-filter-coffee-powder",
    slug: "filter-coffee-powder",
    name: "Filter Coffee Powder",
    categorySlug: "beverages",
    shortDescription: "Traditional South Indian coffee-chicory blend.",
    description:
      "A classic 80:20 coffee-chicory blend, roasted and ground fresh for authentic South Indian filter coffee.",
    images: [placeholderImage("Filter Coffee Powder", { bg: "6b5b2a", fg: "f8edb7" })],
    isVeg: true,
    tags: ["bestseller"],
    ratingAverage: 4.7,
    ratingCount: 143,
    variants: [
      variant("200 g", 220, "SM-COFF-200", { isDefault: true }),
      variant("500 g", 510, "SM-COFF-500"),
    ],
  },
  {
    id: "p-masala-chai-premix",
    slug: "masala-chai-premix",
    name: "Masala Chai Premix",
    categorySlug: "beverages",
    shortDescription: "Spiced tea premix, just add hot water or milk.",
    description:
      "A warming blend of tea, cardamom, ginger and clove — just add hot water or milk for instant masala chai.",
    images: [placeholderImage("Masala Chai Premix", { bg: "6b5b2a", fg: "f8edb7" })],
    isVeg: true,
    tags: ["new"],
    ratingAverage: 4.5,
    ratingCount: 51,
    variants: [variant("200 g", 190, "SM-CHAI-200", { isDefault: true })],
  },
  {
    id: "p-rose-milk-syrup",
    slug: "rose-milk-syrup",
    name: "Rose Milk Syrup",
    categorySlug: "beverages",
    shortDescription: "Fragrant rose syrup for chilled milk.",
    description:
      "Sweet, fragrant rose syrup — just mix with chilled milk for a refreshing summer classic.",
    images: [placeholderImage("Rose Milk Syrup", { bg: "6b5b2a", fg: "f8edb7" })],
    isVeg: true,
    tags: [],
    ratingAverage: 4.4,
    ratingCount: 38,
    variants: [variant("750 ml", 260, "SM-ROSE-750", { isDefault: true })],
  },

  // --- Bakery & Prepared Foods -------------------------------------------
  {
    id: "p-rava-kesari",
    slug: "rava-kesari",
    name: "Rava Kesari",
    categorySlug: "bakery",
    shortDescription: "Saffron semolina pudding, fresh-batch made.",
    description:
      "Semolina cooked in ghee with saffron, sugar and cashews — a warm, comforting South Indian classic, made fresh daily.",
    images: [placeholderImage("Rava Kesari")],
    isVeg: true,
    tags: ["new"],
    ratingAverage: 4.6,
    ratingCount: 47,
    variants: [
      variant("250 g", 180, "SM-KESA-250", { isDefault: true }),
      variant("500 g", 340, "SM-KESA-500"),
    ],
  },
  {
    id: "p-sunnundalu",
    slug: "sunnundalu",
    name: "Sunnundalu",
    categorySlug: "bakery",
    shortDescription: "Andhra-style urad dal and ghee laddu.",
    description:
      "A traditional Andhra favourite — roasted urad dal ground with jaggery and ghee, rolled into rustic, nutty laddus.",
    images: [placeholderImage("Sunnundalu")],
    isVeg: true,
    tags: ["festive"],
    ratingAverage: 4.7,
    ratingCount: 69,
    variants: [
      variant("250 g", 250, "SM-SUNN-250", { isDefault: true }),
      variant("500 g", 480, "SM-SUNN-500"),
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Priya Raghavan",
    location: "Vijayawada",
    rating: 5,
    quote:
      "The Kaju Katli tastes exactly like my grandmother's recipe — and it arrived perfectly packed within a day. This is our go-to for every festival now.",
    avatarUrl: placeholderImage("PR", { size: 128 }),
  },
  {
    id: "t2",
    name: "Arjun Mehta",
    location: "Hyderabad",
    rating: 5,
    quote:
      "Ordered the Diwali hamper for my whole office. Beautifully packaged and every single sweet was fresh. Will absolutely order again.",
    avatarUrl: placeholderImage("AM", { size: 128 }),
  },
  {
    id: "t3",
    name: "Lakshmi Narayanan",
    location: "Chennai",
    rating: 4,
    quote:
      "Andhra Mixture is dangerously addictive. Delivery tracking kept me updated the whole way — really smooth experience.",
    avatarUrl: placeholderImage("LN", { size: 128 }),
  },
];

export const promotions: Promotion[] = [
  {
    id: "promo-welcome",
    title: "Flat 10% off your first order",
    description: "New here? Use code WELCOME10 at checkout.",
    code: "WELCOME10",
    imageUrl: placeholderImage("Flat 10% Off", { bg: "b3401f", fg: "fff7ee" }),
    ctaHref: "/menu",
  },
  {
    id: "promo-festive",
    title: "Festive gifting starts here",
    description: "Free delivery on all Gift Box orders above ₹999.",
    code: "FESTIVEFREE",
    imageUrl: placeholderImage("Festive Gifting", { bg: "7a6118", fg: "fffbef" }),
    ctaHref: "/menu?category=gift-boxes",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.isFeatured);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
