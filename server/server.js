require('dotenv').config();
const dns = require('node:dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/investors', require('./routes/investors'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ai-chat', require('./routes/aiChat'));
app.use('/api', require('./routes/general'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io for real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, content } = data;
    // Save message to DB
    try {
      const { Message } = require('./models/Others');
      const message = await Message.create({ sender, receiver, content });
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit('newMessage', { ...message.toObject(), sender, receiver });
      }
      socket.emit('messageSent', message);
    } catch (err) {
      socket.emit('messageError', { error: err.message });
    }
  });

  socket.on('typing', ({ sender, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit('userTyping', { sender });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
