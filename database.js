const Database = require("better-sqlite3");

const db = new Database("empresa.db");

// CREAR TABLA
db.exec(`
  CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado TEXT,
    servicio TEXT,
    cantidad TEXT,
    estado TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
