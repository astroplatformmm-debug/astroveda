import mongoose, { Schema, model, models } from "mongoose";

const TimeSlotSchema = new Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "09:00 AM"
    isBooked: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
    bookedByOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

// Prevent duplicate slot for same date+time
TimeSlotSchema.index({ date: 1, time: 1 }, { unique: true });

const TimeSlot = models.TimeSlot || model("TimeSlot", TimeSlotSchema);

export default TimeSlot;
