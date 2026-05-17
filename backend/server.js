const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('✅ SQLite Database connected.');
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        event TEXT,
        message TEXT,
        date TEXT
    )
`);

// --- API Routes ---

app.get('/api/feedback', (req, res) => {
    const query = "SELECT * FROM feedback ORDER BY id DESC";
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/feedback', (req, res) => {
    const { name, event, message, date } = req.body;
    const query = `INSERT INTO feedback (name, event, message, date) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [name, event, message, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Targeted Delete Route - Accepts an array of item IDs or 'ALL'
app.post('/api/feedback/delete', (req, res) => {
    const { ids } = req.body; // Expects { ids: [1, 2, 3] } or { ids: 'ALL' }

    if (!ids) {
        return res.status(400).json({ error: "No target identifiers provided" });
    }

    if (ids === 'ALL') {
        db.run("DELETE FROM feedback", (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "All database records successfully cleared" });
        });
    } else {
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid target formatting array" });
        }
        
        // Constructs placeholder binding question marks dynamically safely
        const placeholders = ids.map(() => '?').join(',');
        const query = `DELETE FROM feedback WHERE id IN (${placeholders})`;

        db.run(query, ids, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Successfully removed ${this.changes} records` });
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});