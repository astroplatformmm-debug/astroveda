export const SERVICE_CATEGORY_ENUM = [
  "astrology",
  "puja",
  "numerology",
  "vastu",
  "tarot",
] as const;

export type ServiceCategorySlug = (typeof SERVICE_CATEGORY_ENUM)[number];

const ALLOWED = new Set<string>(SERVICE_CATEGORY_ENUM);

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategorySlug, string> = {
  astrology: "Astrology",
  puja: "Puja",
  numerology: "Numerology",
  vastu: "Vastu",
  tarot: "Tarot Reading",
};

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategorySlug, string> = {
  astrology: "🔮",
  puja: "🪔",
  numerology: "🔢",
  vastu: "🏠",
  tarot: "🃏",
};

export function isServiceCategorySlug(s: string): s is ServiceCategorySlug {
  return ALLOWED.has(s.toLowerCase().trim());
}

export function parseServiceCategoryFilter(categoryParam: string | null): ServiceCategorySlug | null {
  if (categoryParam == null || categoryParam.trim() === "") return null;
  const c = categoryParam.toLowerCase().trim();
  if (c === "all") return null;
  if (ALLOWED.has(c)) return c as ServiceCategorySlug;
  return null;
}

export function normalizeServiceCategory(input: unknown): ServiceCategorySlug {
  if (input == null || input === "") return "astrology";
  if (typeof input !== "string") return "astrology";
  const key = input.toLowerCase().trim();
  if (ALLOWED.has(key)) return key as ServiceCategorySlug;
  return "astrology";
}

export function generateServiceSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
