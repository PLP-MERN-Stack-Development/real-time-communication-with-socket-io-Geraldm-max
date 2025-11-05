require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*' }
});

app.use(express.json());

// --- Simple Mongoose models (user & message) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  online: { type: Boolean, default: false },
  socketId: String
});
const MessageSchema = new mongoose.Schema({
  room: String, // or 'global' or userId for private
  from: String,
  to: String, // optional
  text: String,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// Basic HTTP route
app.get('/', (req, res) => res.send('Socket.io chat server'));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // when user authenticates/registers on connect (simple username approach)
  socket.on('join', async ({ username }) => {
    socket.username = username;
    await User.findOneAndUpdate(
      { username },
      { online: true, socketId: socket.id },
      { upsert: true }
    );
    io.emit('presence', { username, online: true });
  });

  socket.on('join-room', ({ room }) => {
    socket.join(room);
  });

  socket.on('chat-message', async ({ room = 'global', text, from, to }) => {
    const msg = await Message.create({ room, text, from, to });
    // send to room (all clients in room)
    io.to(room).emit('chat-message', msg);
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('typing', { username });
  });

  socket.on('read-message', async ({ messageId, username }) => {
    await Message.findByIdAndUpdate(messageId, { read: true });
    // notify sender
    io.emit('message-read', { messageId, username });
  });

  socket.on('disconnect', async () => {
    if (socket.username) {
      await User.findOneAndUpdate({ username: socket.username }, { online: false, socketId: null });
      io.emit('presence', { username: socket.username, online: false });
    }
    console.log('socket disconnected', socket.id);
  });
});

// DB + start
const start = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socketio-chat');
  server.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
};
start();
