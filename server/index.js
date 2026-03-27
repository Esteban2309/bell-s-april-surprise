const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const db = new Database(path.join(__dirname, 'database.db'));

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Inicializar Base de Datos (Sin UNIQUE en date para permitir pruebas)
db.exec(`
  CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    message TEXT,
    emoji TEXT
  );
  CREATE TABLE IF NOT EXISTS spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_id INTEGER,
    date TEXT,
    FOREIGN KEY(gift_id) REFERENCES gifts(id)
  );
`);

app.get('/api/gifts', (req, res) => {
  const gifts = db.prepare('SELECT * FROM gifts').all();
  res.json(gifts);
});

app.get('/api/spins', (req, res) => {
  const spins = db.prepare('SELECT gift_id, date FROM spins').all();
  res.json(spins);
});

app.post('/api/spins', (req, res) => {
  const { gift_id, date } = req.body;
  console.log(`Intentando guardar giro: Gift ID ${gift_id} para la fecha ${date}`);
  
  try {
    const stmt = db.prepare('INSERT INTO spins (gift_id, date) VALUES (?, ?)');
    stmt.run(gift_id, date);
    console.log("¡Giro guardado con éxito!");
    res.json({ success: true });
  } catch (error) {
    console.error("Error en la DB:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend de Bell corriendo en http://localhost:${port}`);
});
