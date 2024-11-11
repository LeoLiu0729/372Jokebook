const jokeModel = require('../models/jokemodel');

// Get a random joke for the landing page
const getRandomJoke = (req, res) => {
  jokeModel.getRandomJoke((err, joke) => {
    if (err) return res.status(500).json({ error: err.message });
    res.render('index', { joke });
  });
};

// Show categories with a search option
const getCategories = (req, res) => {
  jokeModel.getCategories((err, categories) => {
    if (err) return res.status(500).send("Error loading categories.");
    res.render('categories', { categories });
  });
};

// Show jokes in a selected category
const getJokesByCategory = (req, res) => {
  const category = req.params.category;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  jokeModel.getCategories((err, categories) => {
    if (err) return res.status(500).json({ error: err.message });

    const categoryExists = categories.some(cat => cat.name === category);
    if (!categoryExists) {
      return res.status(404).json({ error: `Category '${category}' not found.` });
    }

    jokeModel.getJokesByCategory(category, limit, (err, jokes) => {
      if (err) return res.status(500).json({ error: err.message });
      res.render('jokes', { category, jokes });
    });
  });
};

// Add a new joke
const addJoke = (req, res) => {
  const { category, setup, delivery } = req.body;
  if (!category || !setup || !delivery) {
    return res.status(400).send("All fields are required!");
  }

  jokeModel.addJoke(category, setup, delivery, (err) => {
    if (err) return res.status(500).send("Error adding joke.");
    res.redirect(`/jokebook/jokes/${category}`);
  });
};

// Fetch jokes from external API if category doesn't exist
const searchExternalJokes = async (req, res) => {
  const category = req.params.category;

  try {
    // Dynamically import node-fetch only when needed
    const fetch = (await import('node-fetch')).default;

    const apiUrl = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?type=twopart&amount=3&blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error || !data.jokes) {
      return res.status(404).send(`No jokes found for '${category}' in the external API.`);
    }

    // Save jokes from the external API to the local database
    data.jokes.forEach(joke => {
      jokeModel.addJoke(category, joke.setup, joke.delivery, (err) => {
        if (err) console.error("Error adding joke from external API:", err.message);
      });
    });

    res.redirect(`/jokebook/jokes/${category}`);
  } catch (err) {
    res.status(500).send("Error fetching jokes from external API.");
  }
};

module.exports = { getRandomJoke, getCategories, getJokesByCategory, addJoke, searchExternalJokes };
