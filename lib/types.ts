export type TimeSlot = {
  _id: string;
  date: string;
  time: string;
  isBooked: boolean;
  isEnabled: boolean;
  bookedByOrderId?: string;
};

export type ServiceKeyPoint = { label: string; desc: string };
export type ServiceBenefit = { label: string; desc: string };
export type ServiceFaq = { question: string; answer: string };

export type Service = {
  _id?: string;
  id?: string;

  title: string;
  slug?: string;
  category?: string;

  // Images
  image?: string;
  bannerImage?: string;

  // Descriptions
  shortDescription?: string;
  description: string;

  // Structured content
  keyPoints?: ServiceKeyPoint[];
  benefits?: ServiceBenefit[];
  faq?: ServiceFaq[];

  // Pricing & booking
  price: number;
  duration?: string;

  // CTA
  ctaText?: string;
  ctaLink?: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  rank?: number;
  isActive?: boolean;
  createdAt?: string;
};

export type ProductOption = {
  label: string;
  price: number;
};

export type RingMaterial = {
  label: string;
  extraPrice: number;
};

export type Product = {
  _id?: string;
  id?: string;
  slug?: string;

  title: string;
  description: string;

  price: number;

  image?: string;
  images?: string[];

  options?: ProductOption[];

  // ✅ Ring Material Support
  ringMaterialEnabled?: boolean;
  ringMaterials?: RingMaterial[];

  // ✅ Per-product benefits
  benefits?: { label: string; desc: string }[];

  rank?: number;

  category?: string;

  zodiac?: string;
  certification?: string;
  mrp?: number; 

  isActive?: boolean;

  createdAt?: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "completed"
  | "failed";

export type BookingSlot = {
  date: string;
  time: string;
};

export type OrderItem = {
  itemId?: string;

  itemType: "service" | "product";

  title?: string;

  price?: number;

  // ✅ Ring Material Order Support
  ringMaterial?: string | null;
  ringMaterialExtraPrice?: number;

  // ✅ Product Option Support
  selectedOption?: string | null;
  selectedOptionPrice?: number;
};

export type Order = {
  _id: string;

  userInfo: {
    name: string;
    email: string;
    phone: string;
  };

  items: OrderItem[];

  totalAmount: number;

  status: OrderStatus;

  bookingSlot?: BookingSlot;

  createdAt?: string;
};
