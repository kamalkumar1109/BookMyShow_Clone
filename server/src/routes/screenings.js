const express = require("express");
const { isLoggedIn, isPartner } = require("../middlewares/user");
const Screening = require("../models/Screening");
const ApiResponse = require("../core/ApiResponse");

const router = express.Router();

router.post("/screenings", isLoggedIn, isPartner, async (req, res) => {
  const { theatreId, movieId, price, showTimings } = req.body;
  const { userId } = req;

  const formattedShowTimings =
    Array.isArray(showTimings) && showTimings.length > 0
      ? showTimings.map((t) => String(t).trim()).filter(Boolean)
      : String(showTimings || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

  const screening = await Screening.create({
    theatreId,
    movieId,
    price,
    author: userId,
    showTimings: formattedShowTimings,
  });

  res.json(ApiResponse.build(true, screening, "Screening created successfully"));
});

router.get("/screenings/:movieId", async (req, res) => {
  const { movieId } = req.params;

  const screenings = await Screening.find({ movieId }).populate({
    path: "theatreId",
    select: "name address contactNo capacity",
  });

  // Return unique theatres, but also include showTimings + price for booking.
  const theatreMap = new Map(); // theatreId -> theatreObj with showTimings set and price

  for (const screening of screenings) {
    const theatre = screening.theatreId;
    if (!theatre) continue;

    const theatreKey = String(theatre._id);
    if (!theatreMap.has(theatreKey)) {
      const baseTheatre =
        typeof theatre.toObject === "function" ? theatre.toObject() : theatre;

      theatreMap.set(theatreKey, {
        ...baseTheatre,
        showTimings: new Set(),
        price: typeof screening.price === "number" ? screening.price : null,
      });
    }

    const entry = theatreMap.get(theatreKey);
    const timings = Array.isArray(screening.showTimings)
      ? screening.showTimings
      : [];
    for (const t of timings) {
      entry.showTimings.add(String(t));
    }

    if (entry.price === null && typeof screening.price === "number") {
      entry.price = screening.price;
    }
  }

  const theatres = Array.from(theatreMap.values()).map((t) => ({
    ...t,
    showTimings: Array.from(t.showTimings),
  }));

  res.json(ApiResponse.build(true, theatres, "Theatres showing this movie"));
});

module.exports = router;
