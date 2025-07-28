const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const setupDatabase = require('./database/setup');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const dealsRoutes = require('./routes/deals');
const disputesRoutes = require('./routes/disputes');
const requisitesRoutes = require('./routes/requisites');
const devicesRoutes = require('./routes/devices');
const messagesRoutes = require('./routes/messages');
const paymentsRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4444;

app.use(cors());
app.use(express.json());

const db = setupDatabase();
const userSockets = {};

app.use((req, res, next) => {
    req.db = db;
    req.io = io;
    req.userSockets = userSockets;
    next();
});

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('register', (userId) => {
        if (userId) {
            userSockets[userId] = socket.id;
            console.log(`User ${userId} registered with socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                console.log(`Unregistered user ${userId}`);
                break;
            }
        }
    });
});


app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/requisites', requisitesRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);

app.use('/admin', express.static(path.join(__dirname, 'admin/build')));
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/build', 'index.html'), (err) => {
        if (err) {
            res.status(500).send("Admin panel has not been built yet. Run 'npm run build' in the /src/admin directory.");
        }
    });
});

app.use(express.static(path.join(__dirname, '../site')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../site', 'auth.html'));
});
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, '../site', page), err => {
            if (err) res.status(404).send('Page not found');
        });
    } else {
        next();
    }
});
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, '../site/pages', req.params.page), err => {
        if (err) res.status(404).send('Page not found');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Main site is available at http://localhost:${PORT}`);
    console.log(`Admin panel is available at http://localhost:${PORT}/admin`);
});
