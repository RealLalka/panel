const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const devices = db.prepare('SELECT * FROM devices ORDER BY created_at DESC').all();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get devices', error: err.message });
    }
});

router.get('/:id', (req, res) => {
    const db = req.db;
    try {
        const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
        if (device) {
            res.json(device);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to get device', error: err.message });
    }
});

router.post('/', (req, res) => {
    const { user_id, name, version } = req.body;
    const db = req.db;
    try {
        const stmt = db.prepare('INSERT INTO devices (user_id, name, version) VALUES (?, ?, ?)');
        const info = stmt.run(user_id, name, version);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create device', error: err.message });
    }
});

module.exports = router;