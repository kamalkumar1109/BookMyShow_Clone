const express = require("express");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_placeholder_replace_in_env",
);
const { isLoggedIn } = require("../middlewares/user");
const ApiResponse = require("../core/ApiResponse");
const { BadRequestError, InternalServerError } = require("../core/ApiError");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const router = express.Router();

const CLIENT_ORIGIN =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

router.post("/payments/confirm", isLoggedIn, async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      throw new BadRequestError("sessionId is required");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const payment = await Payment.findOne({
      sessionId: String(sessionId),
      userId: String(req.userId),
    });

    if (!payment) {
      throw new BadRequestError("Payment record not found for this session");
    }

    if (session.payment_status === "paid") {
      payment.status = "PAID";
      await payment.save();
      if (
        payment.bookingId &&
        mongoose.Types.ObjectId.isValid(payment.bookingId)
      ) {
        await Booking.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: "paid",
          holdExpiresAt: null,
        });
      }
    }

    res.json(
      ApiResponse.build(
        true,
        {
          sessionStatus: session.status,
          paymentStatus: session.payment_status,
          customerEmail:
            session.customer_details?.email ?? session.customer_email ?? null,
          payment: {
            _id: payment._id,
            txnId: payment.txnId,
            amount: payment.amount,
            status: payment.status,
            bookingId: payment.bookingId,
            sessionId: payment.sessionId,
          },
        },
        payment.status === "PAID"
          ? "Payment confirmed"
          : "Payment status updated",
      ),
    );
  } catch (err) {
    if (err instanceof BadRequestError) return next(err);
    if (err.type && err.raw) {
      return next(
        new InternalServerError(err.message || "Stripe session retrieve failed"),
      );
    }
    return next(
      err instanceof Error
        ? new InternalServerError(err.message)
        : new InternalServerError("Payment confirmation failed"),
    );
  }
});

router.post("/payments", isLoggedIn, async (req, res, next) => {
  try {
    const { amount, bookingId, currency = "inr", priceId, ticketCount } =
      req.body;
    const { userId } = req;

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestError("amount must be a positive number");
    }

    const tickets =
      typeof ticketCount === "number" && ticketCount > 0
        ? Math.floor(ticketCount)
        : 1;

    const resolvedPriceId = priceId || STRIPE_PRICE_ID;
    const currencyCode = String(currency || "inr").toLowerCase();

    const productLabel =
      tickets > 1
        ? `Movie tickets (${tickets} seats)${bookingId ? ` · ref ${String(bookingId).slice(-6)}` : ""}`
        : bookingId
          ? `Movie ticket (${bookingId})`
          : "Movie ticket";

    const lineItems = resolvedPriceId
      ? [{ price: resolvedPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: currencyCode,
              product_data: {
                name: productLabel,
              },
              unit_amount: Math.round(amountNum * 100),
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${CLIENT_ORIGIN}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: String(userId),
        ...(bookingId ? { bookingId: String(bookingId) } : {}),
        ticketCount: String(tickets),
      },
    });

    const payment = await Payment.create({
      mthod: "stripe",
      amount: amountNum,
      bookingId: bookingId ? String(bookingId) : undefined,
      userId: String(userId),
      status: "PENDING",
      sessionId: session.id,
    });

    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      const extendMin =
        Number(process.env.BOOKING_PAYMENT_EXTEND_MINUTES) > 0
          ? Number(process.env.BOOKING_PAYMENT_EXTEND_MINUTES)
          : 30;
      await Booking.findByIdAndUpdate(bookingId, {
        holdExpiresAt: new Date(Date.now() + extendMin * 60 * 1000),
      });
    }

    res.json(
      ApiResponse.build(
        true,
        {
          clientSecret: session.client_secret,
          sessionId: session.id,
          paymentId: payment._id,
        },
        "Checkout session created",
      ),
    );
  } catch (err) {
    if (err instanceof BadRequestError) return next(err);
    if (err.type && err.raw) {
      return next(
        new InternalServerError(err.message || "Stripe checkout failed"),
      );
    }
    return next(
      err instanceof Error
        ? new InternalServerError(err.message)
        : new InternalServerError("Payment failed"),
    );
  }
});

router.get("/payments/session-status", async (req, res, next) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId || typeof sessionId !== "string") {
      throw new BadRequestError("session_id query param is required");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json(
      ApiResponse.build(
        true,
        {
          status: session.status,
          customer_email:
            session.customer_details?.email ?? session.customer_email ?? null,
          payment_status: session.payment_status,
        },
        "Session status",
      ),
    );
  } catch (err) {
    if (err instanceof BadRequestError) return next(err);
    return next(
      new InternalServerError(err.message || "Could not retrieve session"),
    );
  }
});

module.exports = router;
