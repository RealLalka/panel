const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const deals = db.prepare('SELECT * FROM deals ORDER BY created_at DESC').all();
        res.json(deals);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get deals', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { user_id, status, amount_usdt, amount_rub } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO deals (user_id, status, amount_usdt, amount_rub) VALUES (?, ?, ?, ?)');
        const info = stmt.run(user_id, status, amount_usdt, amount_rub);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create deal', error: err.message });
    }
});

module.exports = router;