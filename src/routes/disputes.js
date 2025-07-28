const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const disputes = db.prepare('SELECT * FROM disputes ORDER BY created_at DESC').all();
        res.json(disputes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get disputes', error: err.message });
    }
});

router.get('/:id', (req, res) => {
    const db = req.db;
    try {
        const dispute = db.prepare('SELECT * FROM disputes WHERE id = ?').get(req.params.id);
        if (dispute) {
            res.json(dispute);
        } else {
            res.status(404).json({ message: 'Dispute not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to get dispute', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { deal_id, user_id, status } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO disputes (deal_id, user_id, status) VALUES (?, ?, ?)');
        const info = stmt.run(deal_id, user_id, status);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create dispute', error: err.message });
    }
});

module.exports = router;