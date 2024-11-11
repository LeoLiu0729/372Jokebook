const express = require('express');
const router = express.Router();
const jokeController = require('../controllers/jokecontroller');

// Landing page with random joke
router.get('/', jokeController.getRandomJoke);

// View all categories
router.get('/categories', jokeController.getCategories);

// View jokes by category
router.get('/jokes/:category', jokeController.getJokesByCategory);

// Form to add a new joke
router.get('/add-joke', (req, res) => {
  res.render('add-joke');
});

// Handle new joke submission
router.post('/add-joke', jokeController.addJoke);

// Extra Credit: Search external API if category doesn't exist
router.get('/jokes/search/:category', jokeController.searchExternalJokes);

module.exports = router;
