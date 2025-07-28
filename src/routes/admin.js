const express = require('express');
const router = express.Router();

router.post('/reset-data', (req, res) => {
    const db = req.db;
    try {
        db.exec('DELETE FROM deals');
        db.exec('DELETE FROM disputes');
        db.exec('DELETE FROM requisites');
        db.exec('DELETE FROM balance_history');
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('deals', 'disputes', 'requisites', 'balance_history')");

        res.status(200).json({ message: 'All transactional data has been reset.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to reset data', error: err.message });
    }
});

router.get('/balance-history/:userId', (req, res) => {
    const db = req.db;
    try {
        const history = db.prepare('SELECT * FROM balance_history WHERE user_id = ? ORDER BY timestamp DESC').all(req.params.userId);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch balance history', error: err.message });
    }
});

module.exports = router;