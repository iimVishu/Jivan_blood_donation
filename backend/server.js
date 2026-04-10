const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

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
  const { title, message, type = 'info', role } = req.body;
  // Broadcast to all connected clients
  io.emit('new_notification', { title, message, type, role, timestamp: new Date() });
  
  res.json({ success: true, message: 'Notification broadcasted' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});
