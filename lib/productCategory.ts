/** Allowed product category slugs — keep in sync with Mongoose schema + admin selects. */
export const PRODUCT_CATEGORY_ENUM = ["healing", "gemstones", "rudraksha", "pooja"] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORY_ENUM)[number];

const ALLOWED = new Set<string>(PRODUCT_CATEGORY_ENUM);

/** True if `s` is exactly one of the four shop category slugs (case-insensitive). */
export function isProductCategorySlug(s: string): boolean {
  return ALLOWED.has(s.toLowerCase().trim());
}

/**
 * Parse `?category=` for public shop/API: returns slug to filter, or null = all products.
 * Unknown values return null (caller should log); "all" / empty → null.
 */
export function parseShopCategoryFilter(categoryParam: string | null): ProductCategorySlug | null {
  if (categoryParam == null || categoryParam.trim() === "") return null;
  const c = categoryParam.toLowerCase().trim();
  if (c === "all") return null;
  if (ALLOWED.has(c)) return c as ProductCategorySlug;
  return null;
}

/** Map common typos / labels to a canonical slug. */
const ALIASES: Record<string, ProductCategorySlug> = {
  gemstone: "gemstones",
  "gem stones": "gemstones",
  "gem stone": "gemstones",
  "healing crystals": "healing",
  "healing crystal": "healing",
  "pooja items": "pooja",
  "pooja item": "pooja",
};

export function normalizeProductCategory(input: unknown): ProductCategorySlug {
  if (input == null || input === "") return "gemstones";
  if (typeof input !== "string") return "gemstones";
  const key = input.toLowerCase().trim();
  if (ALIASES[key]) return ALIASES[key];
  if (ALLOWED.has(key)) return key as ProductCategorySlug;
  return "gemstones";
}

/** Generate a URL-safe slug from a product title. */
export function generateProductSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
