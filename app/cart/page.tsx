"use client";
import { useLanguage } from "@/context/LanguageContext";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { t } = useLanguage();
  const { cart, removeFromCart, updateQty, totalItems } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-3">{t("Your cart is empty", "आपकी कार्ट खाली है")}</h2>
        <p className="text-[#64748B] mb-8">Add some products to get started</p>
        <Link
          href="/shop"
          className="px-8 py-3 rounded-full bg-[#F97316] text-white font-semibold hover:bg-[#EA6C0A] transition-all shadow-md"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-playfair text-3xl font-bold text-[#0F172A] mb-8">
        Your Cart <span className="text-[#F97316]">({totalItems} items)</span>
      </h1>

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex gap-4 items-center">
            <img
              src={item.image || "https://picsum.photos/seed/default/200/200"}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-[#0F172A] text-base truncate">{item.title}</h3>
              <p className="text-[#F97316] font-bold text-lg">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] text-[#0F172A] font-bold hover:bg-gray-100 flex items-center justify-center"
              >−</button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] text-[#0F172A] font-bold hover:bg-gray-100 flex items-center justify-center"
              >+</button>
            </div>

            <div className="text-right flex-shrink-0 min-w-[80px]">
              <p className="font-bold text-[#0F172A]">₹{item.price * item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-600 text-xs mt-1"
              >{t("Remove", "हटाएं")}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-[#FFF7ED] rounded-xl border border-[#F97316]/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#64748B] font-medium">Subtotal ({totalItems} items)</span>
          <span className="font-bold text-[#0F172A] text-lg">₹{total}</span>
        </div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F97316]/20">
          <span className="text-[#64748B] font-medium">Shipping</span>
          <span className="text-green-600 font-semibold">Free</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-[#0F172A] text-lg">{t("Total", "कुल")}</span>
          <span className="font-bold text-[#F97316] text-2xl">₹{total}</span>
        </div>

        <button
          onClick={() => {
            // Pass first item to checkout for now (extend later for multi-item)
            const first = cart[0];
            router.push(`/checkout?productId=${first.id}`);
          }}
          className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-lg hover:bg-[#EA6C0A] transition-all shadow-lg hover:shadow-xl"
        >
          Proceed to Checkout →
        </button>
        <p className="text-center text-xs text-[#64748B] mt-3">{t("🔒 Secure Payment via Razorpay · UPI / Card / Net Banking", "🔒 Razorpay द्वारा सुरक्षित भुगतान · UPI / कार्ड / नेट बैंकिंग")}</p>
      </div>
    </div>
  );
}
