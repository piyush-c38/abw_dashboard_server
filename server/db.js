// db.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mqtt_data.db'));

// Create table if not exists (with table_id)
db.prepare(`
  CREATE TABLE IF NOT EXISTS data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    table_id TEXT,
    job_id TEXT,
    process_id TEXT,
    weight REAL,
    count INTEGER,
    job_status INTEGER
  )
`).run();

function insert({ table_id, job_id, process_id, weight, count, job_status }) {
  const timestamp = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO data (timestamp, table_id, job_id, process_id, weight, count, job_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(timestamp, table_id, job_id, process_id, weight, count, job_status);
}

module.exports = { db, insert };