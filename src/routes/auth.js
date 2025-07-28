const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your_super_secret_key_change_it';

router.post('/register', (req, res) => {
    const { username, email, password, clid } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }
    const db = req.db;
    const userExists = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
    if (userExists) {
        return res.status(400).json({ message: 'User with this email or username already exists.' });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const defaultPermissions = JSON.stringify(['dashboard', 'deals', 'disputes', 'requisites', 'devices', 'messages', 'payments', 'profile']);

    const stmt_insert = db.prepare('INSERT INTO users (username, email, password, clid, permissions, role) VALUES (?, ?, ?, ?, ?, ?)');
    try {
        const info = stmt_insert.run(username, email, hashedPassword, clid, defaultPermissions, 'user');
        res.status(201).json({ message: 'User registered successfully!', userId: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

router.post('/login', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({ message: 'Please provide login and password.' });
    }
    const db = req.db;
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
    const user = stmt.get(login, login);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).json({ message: 'Invalid password.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: 86400
    });
    res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]'),
        accessToken: token
    });
});

module.exports = router;