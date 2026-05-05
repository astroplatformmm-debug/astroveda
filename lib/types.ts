export type TimeSlot = {
  _id: string;
  date: string;
  time: string;
  isBooked: boolean;
  isEnabled: boolean;
  bookedByOrderId?: string;
};

export type Service = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type Product = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  options?: { label: string; price: number }[];
  category?: string;
  zodiac?: string;
  certification?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type OrderStatus = "pending" | "paid" | "completed" | "failed";
export type BookingSlot = {
  date: string;
  time: string;
};

export type Order = {
  _id: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    itemId?: string;
    itemType: "service" | "product";
    title?: string;
    price?: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  bookingSlot?: BookingSlot;
  createdAt?: string;
};
