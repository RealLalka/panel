const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

function setupDatabase() {
    const db = new Database(path.join(__dirname, 'gatecx.db'));

    try {
        db.exec('ALTER TABLE users ADD COLUMN two_factor_secret TEXT');
        db.exec('ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0');
        console.log("2FA columns added to users table.");
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            console.error("Error altering table:", error);
        }
    }

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            clid TEXT,
            role TEXT NOT NULL DEFAULT 'user',
            permissions TEXT,
            two_factor_secret TEXT,
            two_factor_enabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.exec(createUsersTable);

    db.exec(`CREATE TABLE IF NOT EXISTS deals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, status TEXT NOT NULL, amount_usdt REAL, amount_rub REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS disputes (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER, user_id INTEGER, status TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (deal_id) REFERENCES deals (id), FOREIGN KEY (user_id) REFERENCES users (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS requisites (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL, details TEXT NOT NULL, bank TEXT, status TEXT DEFAULT 'active', balance REAL DEFAULT 0, daily_limit REAL, transaction_limit REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL, status TEXT DEFAULT 'inactive', version TEXT, last_activity DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, content TEXT NOT NULL, status TEXT, bank TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount REAL NOT NULL, currency TEXT NOT NULL, status TEXT, requisite_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id), FOREIGN KEY (requisite_id) REFERENCES requisites (id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS balance_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`);

    const adminUsername = 'admin';
    const adminCheckStmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const adminUser = adminCheckStmt.get(adminUsername);

    if (!adminUser) {
        const adminPassword = 'paneladmin';
        const hashedPassword = bcrypt.hashSync(adminPassword, 8);
        const allPermissions = JSON.stringify(['dashboard', 'deals', 'disputes', 'requisites', 'devices', 'messages', 'payments', 'profile']);

        const insertAdminStmt = db.prepare('INSERT INTO users (username, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)');
        insertAdminStmt.run(adminUsername, 'admin@gatecx.local', hashedPassword, 'admin', allPermissions);
        console.log(`Admin user '${adminUsername}' with password '${adminPassword}' created.`);
    }

    console.log("Database tables created or already exist.");
    return db;
}

module.exports = setupDatabase;
