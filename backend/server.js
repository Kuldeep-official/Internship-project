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
        console.log('SQLite Database connected.');
    }
});

// Created tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            event TEXT,
            message TEXT,
            date TEXT
        )
    `);

    
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `, () => {
        
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_passkey', 'Sysslan@Admin')`);
    });
});

// --- API Routes ---

// Admin validation
app.post('/api/admin/verify', (req, res) => {
    const { passkey } = req.body;
    db.get("SELECT value FROM settings WHERE key = 'admin_passkey'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.value === passkey) {
            return res.json({ success: true });
        }
        return res.status(401).json({ success: false, error: "Incorrect Passkey Access Denied." });
    });
});

// Update password
app.post('/api/admin/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    db.get("SELECT value FROM settings WHERE key = 'admin_passkey'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || row.value !== oldPassword) {
            return res.status(400).json({ success: false, error: "Old password confirmation failed." });
        }
        
        db.run("UPDATE settings SET value = ? WHERE key = 'admin_passkey'", [newPassword], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({ success: true });
        });
    });
});

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

// Targeted Delete Route 
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
        
        
        const placeholders = ids.map(() => '?').join(',');   
        const query = `DELETE FROM feedback WHERE id IN (${placeholders})`;

        db.run(query, ids, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Successfully removed ${this.changes} records` });
        });
    }
});

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});