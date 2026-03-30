const express = require('express');
const Movie = require('../models/Movie');
const ApiResponse = require('../core/ApiResponse');

const router = express.Router();

router.get('/movies', async(req, res)=> {
    const movies = await Movie.find({});
    res.json(ApiResponse.build(true, movies, 'All movies'));
});
router.get('/movies/:id', async(req, res)=> {
    const {id} = req.params;
    const movie = await Movie.findById(id);
    if(!movie){
        throw new NotFoundError('Movie not found');
    }
    res.json(ApiResponse.build(true, movie, 'Movie details'));
});


module.exports = router;