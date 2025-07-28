const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const requisites = db.prepare('SELECT * FROM requisites ORDER BY created_at DESC').all();
        res.json(requisites);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get requisites', error: err.message });
    }
});

router.get('/:id', (req, res) => {
    const db = req.db;
    try {
        const requisite = db.prepare('SELECT * FROM requisites WHERE id = ?').get(req.params.id);
        if (requisite) {
            res.json(requisite);
        } else {
            res.status(404).json({ message: 'Requisite not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to get requisite', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { user_id, name, details, bank } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO requisites (user_id, name, details, bank) VALUES (?, ?, ?, ?)');
        const info = stmt.run(user_id, name, details, bank);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create requisite', error: err.message });
    }
});

module.exports = router;