const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const stmt = db.prepare('SELECT id, username, email, clid, role, permissions, created_at, two_factor_enabled FROM users');
        const users = stmt.all();
        const usersWithParsedPermissions = users.map(user => ({
            ...user,
            permissions: JSON.parse(user.permissions || '[]')
        }));
        res.status(200).json(usersWithParsedPermissions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
});

router.get('/:id', (req, res) => {
    const db = req.db;
    try {
        const stmt = db.prepare('SELECT id, username, email, created_at, two_factor_enabled FROM users WHERE id = ?');
        const user = stmt.get(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user', error: err.message });
    }
});


router.put('/:id/permissions', (req, res) => {
    const { permissions } = req.body;
    const userId = req.params.id;
    const db = req.db;

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Permissions should be an array.' });
    }

    try {
        const permissionsJSON = JSON.stringify(permissions);
        const stmt = db.prepare('UPDATE users SET permissions = ? WHERE id = ?');
        const info = stmt.run(permissionsJSON, userId);

        if (info.changes > 0) {
            const { io, userSockets } = req.app.locals;
            const socketId = userSockets[userId];
            if (socketId) {
                io.to(socketId).emit('permissions_updated', { permissions });
            }
            res.status(200).json({ message: 'User permissions updated successfully.' });
        } else {
            return res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to update permissions', error: err.message });
    }
});

module.exports = router;
