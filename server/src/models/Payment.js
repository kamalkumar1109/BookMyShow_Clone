const crypto = require("crypto");
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    txnId: {
      type: String,
      unique: true,
    },
    userId: String,
    mthod: String,
    amount: Number,
    bookingId: String,
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    sessionId: String
  },
  { timestamps: true },
);

paymentSchema.pre("save", function () {
  if (!this.txnId) {
    this.txnId = "TXN"+crypto.randomBytes(6).toString("hex").toUpperCase();
  }
});
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
