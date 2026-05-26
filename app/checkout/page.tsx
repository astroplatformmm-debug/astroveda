"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef, useState, useEffect, Suspense } from "react";
import { services, gemstones } from "@/lib/mockData";
import Spinner from "@/components/ui/Spinner";
import { useLanguage } from "@/context/LanguageContext";
import type { Product, Service } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on?: (event: string, cb: (resp: any) => void) => void };
  }
}

type CheckoutItem = (Service | Product) & { _id: string };
type PaymentMethod = "online";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const serviceId = searchParams.get("serviceId");
  const productId = searchParams.get("productId");
  const selectedProductOption = searchParams.get("option");
  const selectedOptionPrice = searchParams.get("optionPrice")
    ? Number(searchParams.get("optionPrice"))
    : null;
  const selectedRingMaterial = searchParams.get("ringMaterial");
  const ringMaterialExtraPrice = searchParams.get("ringMaterialExtraPrice")
    ? Number(searchParams.get("ringMaterialExtraPrice"))
    : 0;
  const bookingDate = searchParams.get("date") ?? "";
  const bookingTime = searchParams.get("time") ?? "";

  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", addressLine: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "", addressLine: "", city: "", state: "", pincode: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingItem, setLoadingItem] = useState(true);
  const orderIdRef = useRef<string | null>(null);

  const extractErrorMessage = async (response: Response, fallback: string) => {
    try {
      const body = await response.json();
      return body.error || fallback;
    } catch {
      return fallback;
    }
  };

  const parseJsonSafely = async (res: Response): Promise<any | null> => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const isProbablyObjectId = (value: unknown) =>
    typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!serviceId && !productId) {
          setLoadingItem(false);
          return;
        }
        if (serviceId) {
          const res = await fetch(`/api/services/${serviceId}`);
          if (res.ok) {
            const data = (await res.json()) as Service;
            setItem({ ...data, _id: data._id || serviceId });
          } else {
            const fallback = services.find((s) => s.id === serviceId);
            setItem(fallback ? ({ ...fallback, _id: fallback.id } as CheckoutItem) : null);
          }
        } else if (productId) {
          const res = await fetch(`/api/products/${productId}`);
          if (res.ok) {
            const data = (await res.json()) as Product;
            setItem({ ...data, _id: data._id || productId });
          } else {
            const fallback = gemstones.find((p) => p.id === productId);
            setItem(fallback ? ({ ...fallback, _id: fallback.id } as CheckoutItem) : null);
          }
        }
      } catch (err: unknown) {
        console.error("Checkout item fetch failed:", err);
      } finally {
        setLoadingItem(false);
      }
    };
    fetchItem();
  }, [serviceId, productId]);

  if (loadingItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#FAF7F2] min-h-screen">
        <Spinner className="w-10 h-10 text-[#F97316]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#FAF7F2] min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-[#0F172A]">{t("No item selected for checkout", "चेकआउट के लिए कोई आइटम नहीं चुना")}</h2>
        <button onClick={() => router.push("/")} className="text-[#F97316] underline font-medium">
          Return Home
        </button>
      </div>
    );
  }

  const totalAmount =
    (selectedOptionPrice && selectedOptionPrice > 0 ? selectedOptionPrice : Number(item.price)) +
    (ringMaterialExtraPrice || 0);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", email: "", phone: "", addressLine: "", city: "", state: "", pincode: "" };

    if (!formData.name.trim()) { newErrors.name = "Name is required."; valid = false; }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) { newErrors.email = "Please enter a valid email address."; valid = false; }
    if (!/^\d{10}$/.test(formData.phone)) { newErrors.phone = "Phone number must be exactly 10 digits."; valid = false; }
    if (!formData.addressLine.trim()) { newErrors.addressLine = "Address Line is required."; valid = false; }
    if (!formData.city.trim()) { newErrors.city = "City is required."; valid = false; }
    if (!formData.state.trim()) { newErrors.state = "State is required."; valid = false; }
    if (!/^\d{6}$/.test(formData.pincode)) { newErrors.pincode = "Pincode must be exactly 6 digits."; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startPolling = (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 24;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/payment/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({ orderId }),
        });
        if (res.ok) {
          const data = (await res.json()) as { paid?: boolean };
          if (data.paid) {
            clearInterval(pollInterval);
            window.location.href = `/payment-success?orderId=${orderId}`;
            return;
          }
        }
      } catch (err: unknown) {
        console.error("Poll error:", err);
      }
      if (attempts >= maxAttempts) clearInterval(pollInterval);
    }, 5000);
    return pollInterval;
  };

  // ── Create order helper (shared by both payment methods) ──────────────────
  const createOrder = async (payMethod: PaymentMethod) => {
    const itemId = isProbablyObjectId(item._id) ? item._id : undefined;
    const displayTitle =
      productId && selectedProductOption?.trim()
        ? `${item.title} (${selectedProductOption.trim()})`
        : item.title;

    const items = [
      {
        itemId,
        itemType: serviceId ? "service" : "product",
        title: displayTitle,
        price: totalAmount,
        ...(selectedRingMaterial ? { ringMaterial: selectedRingMaterial, ringMaterialExtraPrice } : {}),
        ...(selectedProductOption ? { selectedOption: selectedProductOption, selectedOptionPrice: selectedOptionPrice ?? undefined } : {}),
      },
    ];

    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userInfo: { name: formData.name, email: formData.email, phone: formData.phone },
        items,
        totalAmount,
        paymentMethod: payMethod,
        address: {
          fullName: formData.name,
          phone: formData.phone,
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        bookingSlot: serviceId && bookingDate && bookingTime ? { date: bookingDate, time: bookingTime } : undefined,
      }),
    });

    const orderBody = await parseJsonSafely(orderRes);
    if (!orderRes.ok) throw new Error(orderBody?.error || "Failed to create order");
    const { orderId } = (orderBody || {}) as { orderId?: string };
    if (!orderId) throw new Error("Order creation failed: missing orderId");
    return orderId;
  };

  // ── Online payment handler ────────────────────────────────────────────────
  const handleOnlinePayment = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setCheckoutError("");
    try {
      const orderId = await createOrder("online");
      orderIdRef.current = orderId;

      const rpOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, amount: totalAmount }),
      });

      const paymentBody = await parseJsonSafely(rpOrderRes);
      if (!rpOrderRes.ok) throw new Error(paymentBody?.error || "Failed to create payment order");

      const razorpayData = (paymentBody || {}) as {
        razorpay_order_id: string;
        amount: number;
        currency: string;
      };

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) throw new Error("Razorpay SDK failed to load");

      let pollInterval: ReturnType<typeof setInterval> | null = null;

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "OMKKAAR ASTROWORLD",
        description: item.title,
        order_id: razorpayData.razorpay_order_id,
        handler: async (response: Record<string, string>) => {
          try {
            if (pollInterval) clearInterval(pollInterval);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderIdRef.current,
              }),
            });
            const verifyData = await parseJsonSafely(verifyRes);
            if (verifyRes.ok && verifyData?.success && orderIdRef.current) {
              window.location.href = `/payment-success?orderId=${orderIdRef.current}`;
              return;
            }
            throw new Error(verifyData?.error || "Verification failed");
          } catch (err: unknown) {
            console.error("Payment verification failed:", err);
            setCheckoutError("Payment verification failed. Please contact support.");
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              if (pollInterval) clearInterval(pollInterval);
              const currentOrderId = orderIdRef.current;
              if (!currentOrderId) throw new Error("Missing order id");
              const statusRes = await fetch("/api/payment/poll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({ orderId: currentOrderId }),
              });
              if (statusRes.ok) {
                const pollData = (await statusRes.json()) as { paid?: boolean };
                if (pollData.paid) {
                  window.location.href = `/payment-success?orderId=${currentOrderId}`;
                  return;
                }
              }
            } catch (err: unknown) {
              console.error("Status check error:", err);
            }
            setIsSubmitting(false);
            setCheckoutError("Payment was not completed. Please try again.");
          },
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#F97316" },
      });

      if (typeof razorpay.on === "function") {
        razorpay.on("payment.failed", (response: any) => {
          console.error("[CHECKOUT] payment.failed:", response?.error || response);
          setCheckoutError("Payment failed. Please try again.");
          setIsSubmitting(false);
        });
      }

      razorpay.open();
      pollInterval = startPolling(orderId);
    } catch (err: unknown) {
      console.error("Online payment failed:", err instanceof Error ? err.message : err);
      setCheckoutError("Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleOnlinePayment();
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-20 min-w-0">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#0F172A] mb-8 border-b border-[#E2E8F0] pb-4">
          {t("Checkout", "चेकआउट")}
        </h1>

        <div className="flex flex-col-reverse md:flex-row gap-8 lg:gap-12">
          {/* ── Form Section ── */}
          <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6 font-playfair">{t("Billing Details", "बिलिंग विवरण")}</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("Full Name", "पूरा नाम")}</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                  placeholder={t("Enter your full name", "अपना पूरा नाम दर्ज करें")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("Email Address", "ईमेल पता")}</label>
                <input
                  type="email"
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                  placeholder={t("you@example.com", "your@email.com")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("Phone Number", "फ़ोन नंबर")}</label>
                <input
                  type="tel"
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                  placeholder={t("10-digit mobile number", "10 अंकों का मोबाइल नंबर")}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              {/* Shipping Address */}
              <div className="pt-2 border-t border-[#E2E8F0] mt-2">
                <h3 className="text-lg font-bold text-[#0F172A] mb-4 font-playfair">{t("Shipping Address", "डिलीवरी पता")}</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("Address Line", "पता पंक्ति")}</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.addressLine ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                      placeholder={t("House/Flat No., Street, Area", "मकान/फ्लैट नं., गली, क्षेत्र")}
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      disabled={isSubmitting}
                    />
                    {errors.addressLine && <p className="mt-1 text-sm text-red-500">{errors.addressLine}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("City", "शहर")}</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.city ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={isSubmitting}
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("State", "राज्य")}</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.state ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={isSubmitting}
                      />
                      {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-1">{t("Pincode", "पिन कोड")}</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.pincode ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]"} focus:outline-none focus:ring-2`}
                      placeholder={t("6-digit Pincode", "6 अंकों का पिन कोड")}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      disabled={isSubmitting}
                    />
                    {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* ── Payment Method ── */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <h3 className="text-lg font-bold text-[#0F172A] mb-4 font-playfair">{t("Payment Method", "भुगतान विधि")}</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#F97316] bg-[#FFF7ED]">
                  <svg className="w-7 h-7 text-[#F97316] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-[#F97316]">{t("Pay Online", "ऑनलाइन भुगतान करें")}</p>
                    <p className="text-xs text-[#64748B]">{t("UPI / Credit Card / Debit Card / Net Banking", "UPI / क्रेडिट कार्ड / डेबिट कार्ड / नेट बैंकिंग")}</p>
                  </div>
                  <span className="ml-auto text-xs bg-[#F97316] text-white px-2 py-0.5 rounded-full">{t("Selected ✓", "चयनित ✓")}</span>
                </div>
                <p className="mt-3 text-xs text-[#64748B] bg-[#FFF7ED] border border-[#F97316]/20 rounded-lg px-3 py-2">
                  {t("🔒 Secure payment via Razorpay. Supports UPI, Credit/Debit Cards & Net Banking.", "🔒 Razorpay द्वारा सुरक्षित भुगतान। UPI, क्रेडिट/डेबिट कार्ड और नेट बैंकिंग समर्थित।")}
                </p>
              </div>

              {/* ── Submit Button ── */}
              <div className="pt-4">
                {checkoutError && <p className="mb-3 text-sm text-red-500">{checkoutError}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all disabled:opacity-70 bg-[#F97316] hover:bg-[#EA6C0A] focus:ring-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    `${t("💳 Pay Now", "💳 अभी भुगतान करें")} — ₹${totalAmount}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full md:w-96 md:max-w-md min-w-0 shrink-0">
            <div className="bg-[#FFF7ED] p-6 md:p-8 rounded-2xl border border-[#F97316]/20 md:sticky md:top-24">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6 font-playfair">{t("Order Summary", "ऑर्डर सारांश")}</h2>

              <div className="flex items-start mb-6">
                <img
                  src={item.image || "https://picsum.photos/seed/default/600/400"}
                  alt={item.title}
                  className="w-20 h-20 shrink-0 object-cover rounded-lg mr-4 border border-[#F97316]/30 shadow-sm max-w-full"
                />
                <div>
                  <h3 className="font-bold text-[#0F172A] line-clamp-2">{item.title}</h3>
                  {selectedProductOption && (
                    <p className="text-xs text-[#64748B] mt-0.5">Option: {selectedProductOption}</p>
                  )}
                  {selectedRingMaterial && (
                    <p className="text-xs text-[#64748B]">Ring: {selectedRingMaterial}</p>
                  )}
                  <p className="text-[#F97316] font-extrabold mt-1 text-lg">₹{totalAmount}</p>
                  {"duration" in item && (
                    <span className="inline-block mt-1 bg-white px-2 py-0.5 border border-[#F97316]/30 rounded text-xs text-[#0F172A] font-medium shadow-sm">
                      {item.duration}
                    </span>
                  )}
                  {serviceId && bookingDate && bookingTime && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-[#7C3AED] uppercase mb-1">{t("Appointment", "अपॉइंटमेंट")}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(bookingDate + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-bold text-[#D97706]">{bookingTime}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#F97316]/20 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-[#64748B] font-medium">
                  <span>{t("Subtotal", "उप-कुल")}</span>
                  <span>₹{selectedOptionPrice && selectedOptionPrice > 0 ? selectedOptionPrice : item.price}</span>
                </div>
                {ringMaterialExtraPrice > 0 && (
                  <div className="flex justify-between text-sm text-[#64748B] font-medium">
                    <span>Ring Setting ({selectedRingMaterial})</span>
                    <span>+₹{ringMaterialExtraPrice}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#64748B] font-medium">
                  <span>{t("Shipping", "शिपिंग")}</span>
                  <span className="text-green-600 font-semibold">{t("Free", "मुफ़्त")}</span>
                </div>
                <div className="flex justify-between text-sm text-[#64748B] font-medium">
                  <span>{t("Taxes & Fees", "कर और शुल्क")}</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-[#0F172A] pt-3 border-t border-[#F97316]/20">
                  <span>{t("Total", "कुल")}</span>
                  <span className="text-[#F97316]">₹{totalAmount}</span>
                </div>

                {/* Payment method badge in summary */}
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20">
                  {t("💳 Online Payment", "💳 ऑनलाइन भुगतान")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#FAF7F2]"><Spinner className="w-10 h-10 text-[#F97316]" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
