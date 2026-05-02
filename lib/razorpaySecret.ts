/**
 * Razorpay dashboard "Key secret" — support common env names (Vercel often uses RAZORPAY_KEY_SECRET).
 */
export function getRazorpayKeySecret(): string {
  const a = process.env.RAZORPAY_SECRET?.trim();
  const b = process.env.RAZORPAY_KEY_SECRET?.trim();
  return a || b || "";
}

/**
 * Key ID must match checkout (`NEXT_PUBLIC_RAZORPAY_KEY_ID`). Prefer server-only `RAZORPAY_KEY_ID`, then public.
 */
export function getRazorpayKeyId(): string {
  const a = process.env.RAZORPAY_KEY_ID?.trim();
  const b = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  return a || b || "";
}
