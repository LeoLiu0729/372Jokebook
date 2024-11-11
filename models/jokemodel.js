const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE)`);
  db.run(`CREATE TABLE IF NOT EXISTS jokes (id INTEGER PRIMARY KEY, setup TEXT, delivery TEXT, category_id INTEGER, FOREIGN KEY(category_id) REFERENCES categories(id))`);
});

// Get all categories
const getCategories = (callback) => {
  db.all(`SELECT name FROM categories`, callback);
};

// Get jokes by category with an optional limit
const getJokesByCategory = (category, limit, callback) => {
  const query = `SELECT setup, delivery FROM jokes WHERE category_id = (SELECT id FROM categories WHERE name = ?) LIMIT ?`;
  db.all(query, [category, limit || -1], callback);
};

// Get a random joke
const getRandomJoke = (callback) => {
  const query = `SELECT setup, delivery FROM jokes ORDER BY RANDOM() LIMIT 1`;
  db.get(query, callback);
};

// Add a new joke to a specific category
const addJoke = (category, setup, delivery, callback) => {
  db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [category], function(err) {
    if (err) return callback(err);

    db.get(`SELECT id FROM categories WHERE name = ?`, [category], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error(`Category '${category}' not found.`));

      const categoryId = row.id;
      db.run(`INSERT INTO jokes (setup, delivery, category_id) VALUES (?, ?, ?)`, [setup, delivery, categoryId], callback);
    });
  });
};

module.exports = { getCategories, getJokesByCategory, getRandomJoke, addJoke };
