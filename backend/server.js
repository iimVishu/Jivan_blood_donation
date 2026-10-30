const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { timingSafeEqual } = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const origins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(value => value.trim());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: origins }));
app.use(express.json());

// Database Connection
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`User connected to Socket.IO: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('Blood Donation Backend & Socket.IO is running');
});

// Endpoint to trigger a global real-time notification
app.post('/api/notify', (req, res) => {
  const token = process.env.NOTIFICATION_API_TOKEN;
  const supplied = Buffer.from(req.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${token || ''}`);
  if (!token || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { title, message, type = 'info', role } = req.body;
  if (typeof title !== 'string' || !title.trim() || title.length > 200 || typeof message !== 'string' || !message.trim() || message.length > 5000 || !['info', 'success', 'warning', 'error'].includes(type) || (role && !['all', 'donor', 'recipient', 'hospital', 'admin'].includes(role))) {
    return res.status(400).json({ error: 'Invalid notification' });
  }
  // Broadcast to all connected clients
  io.emit('new_notification', { title, message, type, role, timestamp: new Date() });
  
  res.json({ success: true, message: 'Notification broadcasted' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${httpServer.address().port}`);
});
