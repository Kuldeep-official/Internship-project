const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    console.log('✅ SQLite Database connected.');
});

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    event TEXT,
    message TEXT,
    date TEXT
)`);

// GET all feedback
app.get('/api/feedback', (req, res) => {
    db.all("SELECT * FROM feedback ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// POST new feedback
app.post('/api/feedback', (req, res) => {
    const { name, event, message, date } = req.body;
    db.run(`INSERT INTO feedback (name, event, message, date) VALUES (?, ?, ?, ?)`,
        [name, event, message, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// NEW: DELETE all feedback (The Purge)
app.delete('/api/feedback/clear', (req, res) => {
    db.run("DELETE FROM feedback", (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Database cleared" });
    });
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));