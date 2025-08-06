const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your_super_secret_key_change_it';

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

router.post('/register', (req, res) => {
    const { username, email, password, clid } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Пожалуйста, укажите имя пользователя, email и пароль.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Пожалуйста, введите корректный email адрес.' });
    }

    const db = req.db;
    const lowerCaseEmail = email.toLowerCase();

    const userExists = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR username = ?').get(lowerCaseEmail, username);
    if (userExists) {
        return res.status(400).json({ message: 'Пользователь с таким email или именем пользователя уже существует.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const defaultPermissions = JSON.stringify(['dashboard', 'deals', 'disputes', 'requisites', 'devices', 'messages', 'payments', 'profile']);

    const stmt_insert = db.prepare('INSERT INTO users (username, email, password, clid, permissions, role) VALUES (?, ?, ?, ?, ?, ?)');
    try {
        const info = stmt_insert.run(username, lowerCaseEmail, hashedPassword, clid, defaultPermissions, 'user');
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при регистрации пользователя', error: err.message });
    }
});

router.post('/login', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({ message: 'Please provide login and password.' });
    }
    const db = req.db;

    const lowerCaseLogin = login.toLowerCase();
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR username = ?');
    const user = stmt.get(lowerCaseLogin, login);

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
        created_at: user.created_at,
        two_factor_enabled: user.two_factor_enabled,
        accessToken: token
    });
});

module.exports = router;
