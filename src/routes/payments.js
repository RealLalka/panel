const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const payments = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get payments', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { user_id, amount, currency, status, requisite_id } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO payments (user_id, amount, currency, status, requisite_id) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(user_id, amount, currency, status, requisite_id);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create payment', error: err.message });
    }
});

module.exports = router;
