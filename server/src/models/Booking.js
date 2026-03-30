const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    theatre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    seats: [{
        type: String,
        required: true
    }],
    showTime: String,
    amount: {
        type: Number,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending',
    },
    holdExpiresAt: {
        type: Date,
    },

},{timestamps: true});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;