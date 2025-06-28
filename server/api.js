const express = require('express');
const cors = require('cors');
const { db, insert } = require('./db'); 
const { getConnectedTables } = require('./subscriber');

const app = express();
const PORT = 5000;

app.use(cors());

// GET latest entry per table for the current date only
app.get('/api/latest-per-table', (req, res) => {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().slice(0, 10);

        const rows = db.prepare(`
            SELECT * FROM data 
            WHERE substr(timestamp, 1, 10) = ?
            AND id IN (
                SELECT MAX(id) FROM data WHERE substr(timestamp, 1, 10) = ? GROUP BY table_id
            )
            ORDER BY table_id
        `).all(today, today);

        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch data:', err);
        res.status(500).send('Error fetching data');
    }
});

// Optional: GET full table for testing
app.get('/api/all', (req, res) => {
    try {
        const rows = db.prepare(`SELECT * FROM data ORDER BY id DESC`).all();
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch data:', err);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/day-summary', (req, res) => {
    try {
        const { date } = req.query; // expects YYYY-MM-DD
        if (!date) {
            return res.status(400).json({ error: "Missing date query parameter (YYYY-MM-DD)" });
        }

        // Get all rows for the requested day
        // We use substr to extract the date part from the ISO timestamp
        const rows = db.prepare(`
            SELECT *
            FROM data
            WHERE substr(timestamp, 1, 10) = ?
            AND id IN (
                SELECT MAX(id)
                FROM data
                WHERE substr(timestamp, 1, 10) = ?
                GROUP BY table_id, job_id, process_id
            )
            ORDER BY table_id, job_id, process_id
        `).all(date, date);

        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch day summary:', err);
        res.status(500).send('Error fetching day summary');
    }
});

app.get('/api/machine-status', (req, res) => {
    try {
        const connected = getConnectedTables();
        // Return all known table_ids and their status
        const status = connected.map(table_id => ({
            table_id,
            status: "ON"
        }));
        res.json(status);
    } catch (err) {
        res.status(500).send('Error fetching machine status');
    }
});

app.listen(PORT, () => {
    console.log(`API Server running at http://localhost:${PORT}`);
});