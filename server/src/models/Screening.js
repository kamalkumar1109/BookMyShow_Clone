const mongoose = require('mongoose');
const screeningSchema = new mongoose.Schema({
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    price: {
        type: Number,
        min: 0
    },
    showTimings: [
        {
            type: String,
            required: true
        }
    ]
})
const Screening = mongoose.model('Screening', screeningSchema);
module.exports = Screening;