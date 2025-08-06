const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    try {
        const stmt = db.prepare('SELECT id, username, email, clid, role, permissions, created_at FROM users');
        const users = stmt.all();
        const usersWithParsedPermissions = users.map(user => ({
            ...user,
            permissions: JSON.parse(user.permissions || '[]')
        }));
        res.status(200).json(usersWithParsedPermissions);
    } catch (err) {
        console.error("!!! Критическая ошибка при получении пользователей:", err);
        res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
});

router.get('/:id', (req, res) => {
    const db = req.db;
    try {
        const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
        const user = stmt.get(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(`!!! Ошибка при получении пользователя с ID ${req.params.id}:`, err);
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
            const { io, userSockets } = req;

            if (io && userSockets) {
                const socketId = userSockets[userId];
                if (socketId) {
                    console.log(`[Socket] Attempting to send 'permissions_updated' to user ${userId} on socket ${socketId}`);
                    io.to(socketId).emit('permissions_updated', { permissions });
                } else {
                    console.log(`[Socket] User ${userId} is not currently connected. Cannot send real-time update.`);
                }
            } else {
                console.log("[Socket] Socket.io system (io or userSockets) is not available. Skipping real-time update.");
            }

            res.status(200).json({ message: 'User permissions updated successfully.' });
        } else {
            return res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.error(`!!! Ошибка при обновлении прав для пользователя с ID ${userId}:`, err);
        res.status(500).json({ message: 'Failed to update permissions', error: err.message });
    }
});

module.exports = router;
