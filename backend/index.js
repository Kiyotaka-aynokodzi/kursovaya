const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;
const JWT_SECRET = 'bvdh5tKj9LhT6hJd9kLhA3gWv1r5C6c5t';

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/backend/img', express.static(path.join(__dirname, 'img'))); // Путь до папки с загруженными изображениями
app.use(express.static(path.join(__dirname, 'frontend')));

// Настройка хранения для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'img')); // Сохраняем файлы в 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price } = req.body;
  const image = req.file.filename; // Сохраняем только имя файла

  db.run(`INSERT INTO products (name, price, image) VALUES (?, ?, ?)`, [name, price, image], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, price, image });
  });
});

let db = new sqlite3.Database(path.join(__dirname, 'bd', 'products.db'), (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the products database.');
});

db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    image TEXT
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


app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
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


app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      return res.status(500).send('User already exists.');
    }
    res.status(201).send('User registered successfully.');
  });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(404).send('User not found.');
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).send('Invalid password.');
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ auth: true, token });
  });
});

app.post('/api/news', upload.single('image'), (req, res) => {
  const { name, description } = req.body;
  const image = req.file.filename; // Сохраняем только имя файла

  db.run(`INSERT INTO news (name, description, image) VALUES (?, ?, ?)`, [name, description, image], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, description, image });
  });
});

app.get('/api/news', (req, res) => {
  db.all('SELECT * FROM news', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});