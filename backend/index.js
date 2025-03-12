const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/backend/img', express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Database connection
let db = new sqlite3.Database(path.join(__dirname, 'bd', 'products.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the products database.');
});
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE -- Add UNIQUE constraint
  )`, (err) => {
      if (err) {
          console.error("Ошибка при создании таблицы addresses:", err.message);
      } else {
          console.log("Таблица addresses успешно создана.");

          // Add initial addresses using INSERT INTO
          const initialAddresses = [
              'ул. Пушкина, 10',
              'пр. Ленина, 25',
              'ул. Гагарина, 5'
          ];

          initialAddresses.forEach(address => {
              db.run(`INSERT OR IGNORE INTO addresses (address) VALUES (?)`, [address], (err) => {
                  if (err) {
                      console.error(`Failed to insert address ${address}: ${err.message}`);
                  }
              });
          });
      }
  });

  db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      image TEXT,
      address_id INTEGER,
      FOREIGN KEY (address_id) REFERENCES addresses(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS korzina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
  )`);
});


// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'img'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API Endpoints for Addresses
app.get('/api/addresses', (req, res) => {
    db.all('SELECT * FROM addresses', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/addresses', (req, res) => {
    const { address } = req.body;

    db.run(`INSERT INTO addresses (address) VALUES (?)`, [address], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, address });
    });
});

// API Endpoints for Products
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, address_id } = req.body;
    const image = req.file.filename;

    db.run(`INSERT INTO products (name, price, image, address_id) VALUES (?, ?, ?, ?)`, [name, price, image, address_id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, price, image, address_id });
    });
});

app.get('/api/products', (req, res) => {
    const address_id = req.query.address_id;  // Get address_id from query parameters
    let query = 'SELECT * FROM products';
    let params = [];

    if (address_id) {
        query += ' WHERE address_id = ?';
        params.push(address_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/search', (req, res) => {
  const searchTerm = req.body.searchTerm;

  db.all(`SELECT * FROM products WHERE name LIKE ?`, [`%${searchTerm}%`], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ results: rows });
  });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
