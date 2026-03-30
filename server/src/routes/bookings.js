const express = require("express");
const { isLoggedIn } = require("../middlewares/user");
const { ApiError, BadRequestError, InternalServerError } = require("../core/ApiError");
const ApiResponse = require("../core/ApiResponse");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const router = express.Router();

const defaultHoldMinutes = () =>
  Number(process.env.BOOKING_HOLD_MINUTES) > 0
    ? Number(process.env.BOOKING_HOLD_MINUTES)
    : 15;

/** Bookings that still block a seat (paid, legacy, or unpaid hold not yet expired). */
function activeHoldQuery() {
  const now = new Date();
  const holdMs = defaultHoldMinutes() * 60 * 1000;
  const createdCutoff = new Date(Date.now() - holdMs);
  return {
    $or: [
      { paymentStatus: "paid" },
      { paymentStatus: { $exists: false } },
      {
        paymentStatus: "pending",
        holdExpiresAt: { $gt: now },
      },
      {
        paymentStatus: "pending",
        holdExpiresAt: { $exists: false },
        createdAt: { $gte: createdCutoff },
      },
    ],
  };
}

router.get("/bookings/me", isLoggedIn, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("theatre", "name address")
      .populate("movie", "title posterUrl")
      .lean();

    res.json(
      ApiResponse.build(
        true,
        { bookings },
        "Your bookings",
      ),
    );
  } catch (err) {
    return next(
      new InternalServerError(err.message || "Could not load bookings"),
    );
  }
});

router.get("/bookings/seat-occupancy", async (req, res, next) => {
  try {
    const { theatreId, movieId, showTime } = req.query;

    if (!theatreId || !movieId || !showTime) {
      throw new BadRequestError(
        "theatreId, movieId, and showTime query params are required",
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(theatreId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      throw new BadRequestError("Invalid theatreId or movieId");
    }

    const st = String(showTime).trim();
    const bookings = await Booking.find({
      theatre: theatreId,
      movie: movieId,
      showTime: st,
      ...activeHoldQuery(),
    }).select("seats");

    const bookedSeats = Array.from(
      new Set(bookings.flatMap((b) => b.seats || []).map(String)),
    );

    res.json(
      ApiResponse.build(
        true,
        { bookedSeats },
        "Seat occupancy",
      ),
    );
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(
      new InternalServerError(err.message || "Seat occupancy failed"),
    );
  }
});

router.post("/bookings", isLoggedIn, async (req, res) => {
  try {
    const { theatreId, movieId, amount, seats, showTime } = req.body;
    const { userId } = req;

    if (!theatreId || !movieId) {
      throw new BadRequestError("theatreId and movieId are required");
    }

    if (
      !mongoose.Types.ObjectId.isValid(theatreId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      throw new BadRequestError("Invalid theatreId or movieId");
    }

    if (!showTime) {
      throw new BadRequestError("showTime is required");
    }

    if (typeof showTime !== "string" || showTime.trim().length === 0) {
      throw new BadRequestError("Invalid showTime");
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      throw new BadRequestError("Please select seats");
    }

    const cleanedSeats = Array.from(
      new Set(
        seats.map((s) => String(s).trim()).filter((s) => s && s.length > 0),
      ),
    );

    if (cleanedSeats.length === 0) {
      throw new BadRequestError("Please select valid seats");
    }

    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue < 0) {
      throw new BadRequestError(
        "amount must be a valid non-negative number",
      );
    }

    const st = showTime.trim();

    const existingBooking = await Booking.findOne({
      theatre: theatreId,
      movie: movieId,
      showTime: st,
      seats: { $in: cleanedSeats },
      ...activeHoldQuery(),
    });

    if (existingBooking) {
      throw new BadRequestError("Some of these seats are already booked");
    }

    const holdMs = defaultHoldMinutes() * 60 * 1000;

    const booking = await Booking.create({
      theatre: theatreId,
      movie: movieId,
      amount: amountValue,
      user: userId,
      seats: cleanedSeats,
      showTime: st,
      paymentStatus: "pending",
      holdExpiresAt: new Date(Date.now() + holdMs),
    });

    res.json(
      ApiResponse.build(true, booking, "Booking created successfully"),
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new InternalServerError(err.message || "Booking failed");
  }
});

module.exports = router;
