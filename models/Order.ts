import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new mongoose.Schema({
  userInfo: {
    name: { type: String, required: true },
    email: { type: String, required: false, default: "" },
    phone: { type: String, required: true },
  },
  items: [
    {
      itemId: mongoose.Schema.Types.ObjectId,
      itemType: { type: String, enum: ["service", "product"] },
      title: String,
      price: Number,
    },
  ],
  address: {
    fullName: String,
    phone: String,
    addressLine: String,
    city: String,
    state: String,
    pincode: String,
  },
  totalAmount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: {
    type: String,
    enum: ["pending", "paid", "completed", "failed"],
    default: "pending",
  },
  receipt: {
    type: String,
    unique: true,
    sparse: true,
  },
  bookingSlot: {
    date: { type: String, default: null },
    time: { type: String, default: null },
    slotType: { type: String, enum: ["online", "offline"], default: "online" },
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
