const express = require('express');
const app = express();
const jokeRoutes = require('./routes/jokeroutes');
const path = require('path');

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Use joke routes
app.use('/jokebook', jokeRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
