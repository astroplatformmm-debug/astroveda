import mongoose, { Schema, model, models } from "mongoose";

const TimeSlotSchema = new Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    slotType: { type: String, enum: ["online", "offline"], default: "online" },
    isBooked: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
    bookedByOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

TimeSlotSchema.index({ date: 1, time: 1, slotType: 1 }, { unique: true });

const TimeSlot = models.TimeSlot || model("TimeSlot", TimeSlotSchema);

export default TimeSlot;
