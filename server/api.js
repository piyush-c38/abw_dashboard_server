const express = require('express');
const cors = require('cors');
const { db, insert } = require('./db'); 
const { getConnectedTables } = require('./subscriber');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Add JSON parsing middleware

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

// Weight management endpoints
app.get('/api/weights', (req, res) => {
    try {
        // Clear the module cache so next require gets fresh data
        delete require.cache[require.resolve('./variable')];
        
        const { getWeightMap } = require('./variable');
        const weights = getWeightMap();
        res.json(weights);
        console.log(weights);
    } catch (err) {
        console.error('Failed to fetch weights:', err);
        res.status(500).send('Error fetching weights');
    }
});

app.post('/api/weights', (req, res) => {
    try {
        const { jobId, processId, weight } = req.body;
        
        if (!jobId || !processId || weight === undefined) {
            return res.status(400).json({ error: "Missing required fields: jobId, processId, weight" });
        }

        // Read current variable.js file
        const variablePath = path.join(__dirname, 'variable.js');
        let fileContent = fs.readFileSync(variablePath, 'utf8');
        
        // Parse the weightMap from the file
        const weightMapMatch = fileContent.match(/const weightMap = ({[\s\S]*?});/);
        if (!weightMapMatch) {
            return res.status(500).json({ error: "Unable to parse weightMap" });
        }
        
        let weightMap = eval('(' + weightMapMatch[1] + ')');
        
        // Add or update the weight
        if (!weightMap[jobId]) {
            weightMap[jobId] = {};
        }
        weightMap[jobId][processId] = parseInt(weight);
        
        // Generate new file content
        const newWeightMapStr = JSON.stringify(weightMap, null, 2);
        const newFileContent = fileContent.replace(
            /const weightMap = {[\s\S]*?};/,
            `const weightMap = ${newWeightMapStr};`
        );
        
        // Write back to file
        fs.writeFileSync(variablePath, newFileContent);
        
        // Clear the module cache so next require gets fresh data
        delete require.cache[require.resolve('./variable')];
        
        res.json({ success: true, message: "Weight updated successfully" });
    } catch (err) {
        console.error('Failed to update weight:', err);
        res.status(500).send('Error updating weight');
    }
});

app.delete('/api/weights/:jobId/:processId', (req, res) => {
    try {
        const { jobId, processId } = req.params;
        
        // Read current variable.js file
        const variablePath = path.join(__dirname, 'variable.js');
        let fileContent = fs.readFileSync(variablePath, 'utf8');
        
        // Parse the weightMap from the file
        const weightMapMatch = fileContent.match(/const weightMap = ({[\s\S]*?});/);
        if (!weightMapMatch) {
            return res.status(500).json({ error: "Unable to parse weightMap" });
        }
        
        let weightMap = eval('(' + weightMapMatch[1] + ')');
        
        // Remove the weight
        if (weightMap[jobId] && weightMap[jobId][processId]) {
            delete weightMap[jobId][processId];
            
            // If job has no more processes, remove the job entirely
            if (Object.keys(weightMap[jobId]).length === 0) {
                delete weightMap[jobId];
            }
        }
        
        // Generate new file content
        const newWeightMapStr = JSON.stringify(weightMap, null, 2);
        const newFileContent = fileContent.replace(
            /const weightMap = {[\s\S]*?};/,
            `const weightMap = ${newWeightMapStr};`
        );
        
        // Write back to file
        fs.writeFileSync(variablePath, newFileContent);
        
        // Clear the module cache so next require gets fresh data
        delete require.cache[require.resolve('./variable')];
        
        res.json({ success: true, message: "Weight deleted successfully" });
    } catch (err) {
        console.error('Failed to delete weight:', err);
        res.status(500).send('Error deleting weight');
    }
});

app.listen(PORT, () => {
    console.log(`API Server running at http://localhost:${PORT}`);
});