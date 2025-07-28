const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get messages', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { user_id, content, status, bank } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO messages (user_id, content, status, bank) VALUES (?, ?, ?, ?)');
        const info = stmt.run(user_id, content, status, bank);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create message', error: err.message });
    }
});

module.exports = router;