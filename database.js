const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./empresa.db");

// CREAR TABLA
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empleado TEXT,
      servicio TEXT,
      cantidad TEXT,
      estado TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;