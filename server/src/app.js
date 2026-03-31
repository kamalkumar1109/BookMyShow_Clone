const express = require('express');
const moviesRoutes = require('./routes/movies');
const userRoutes = require('./routes/user');
const theatreRoutes = require('./routes/theatres');
const screeningRoutes = require('./routes/screenings');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payment');
const cors = require('cors');
const { ApiError } = require('./core/ApiError');

const app = express();

app.use(express.json());
app.use(cors());

//Routes
app.use(moviesRoutes);
app.use(userRoutes);
app.use(theatreRoutes);
app.use(screeningRoutes);
app.use(bookingRoutes);
app.use(paymentRoutes)

//Global Exception Handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
      const { status = 500, message = "Something went wrong" } = err;
      return res.status(status).json({ success: false, message });
    }
    return res.status(500).json({ success: false, message: "Something went wrong" });
});

module.exports = app;