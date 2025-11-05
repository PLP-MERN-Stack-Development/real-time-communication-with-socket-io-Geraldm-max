Real-Time Chat Application with Socket.io
📖 Project Overview

This project is a real-time chat application built using the MERN stack and Socket.io. It demonstrates bidirectional, event-based communication between clients and the server, allowing users to chat instantly, see online/offline status, and get live notifications.

🧠 Core Technologies

MongoDB + Mongoose – for storing users and messages

Express.js – backend web framework

React.js (Vite) – frontend interface

Socket.io – real-time, bidirectional communication

JWT & bcryptjs – for authentication (extendable)

dotenv – for environment variable management

⚙️ Setup Instructions
🧩 Prerequisites

Node.js v18+

npm or yarn

MongoDB running locally or via MongoDB Atlas

🖥️ Server Setup
cd server
npm init -y
npm install express socket.io mongoose jsonwebtoken bcryptjs dotenv
# For development
npm install -D nodemon


Start the server:

npm run dev


Example .env file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/socketio-chat
CLIENT_ORIGIN=http://localhost:5173

💻 Client Setup
cd client
npm create vite@latest
npm install socket.io-client axios
npm run dev


Set up .env in client:

VITE_SERVER_URL=http://localhost:5000

🧱 Folder Structure
socketio-chat/
├── client/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── socket/
│   │   │   └── socket.js
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── server.js
│  
│   └── package.json
└── README.md

💬 Features Implemented
✅ Core Chat Functionality

Real-time global chat using Socket.io

Displays sender name and timestamp

Online/offline presence broadcast

Typing indicator events

Persistent message storage in MongoDB

💎 Advanced Features

Private messaging (room-based via socket.join(room))

Read receipts via read-message event

User presence tracking

Typing indicator broadcast to other users

Extensible authentication (JWT-ready)

🔔 Real-Time Notifications

When a new user joins or leaves

When a message is sent

“User is typing” alert

🧪 How It Works
🔄 Connection Flow

User connects → sends join event with username

Server updates MongoDB and broadcasts presence

Client sends messages via chat-message

Server stores and emits message to all connected clients

Typing and read events update UI in real time

🧰 Key Code Snippets
Server (server/server.js)
io.on('connection', (socket) => {
  socket.on('join', async ({ username }) => {
    socket.username = username;
    await User.findOneAndUpdate({ username }, { online: true, socketId: socket.id }, { upsert: true });
    io.emit('presence', { username, online: true });
  });

  socket.on('chat-message', async ({ room = 'global', text, from, to }) => {
    const msg = await Message.create({ room, text, from, to });
    io.to(room).emit('chat-message', msg);
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('typing', { username });
  });

  socket.on('disconnect', async () => {
    if (socket.username) {
      await User.findOneAndUpdate({ username: socket.username }, { online: false, socketId: null });
      io.emit('presence', { username: socket.username, online: false });
    }
  });
});

Client (client/src/App.jsx)
import React, { useState } from 'react';
import useSocket from './hooks/useSocket';

export default function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useSocket({
    username,
    onMessage: (msg) => setMessages((m) => [...m, msg]),
    onPresence: (p) => console.log('presence', p),
    onTyping: (t) => console.log('typing', t),
  });

  const send = () => {
    socket.emit('chat-message', { room: 'global', text: 'Hello!', from: username });
  };

  return (
    <div>
      {!username ? (
        <input placeholder="Enter username" onBlur={(e) => setUsername(e.target.value)} />
      ) : (
        <>
          <button onClick={send}>Send Hello</button>
          <ul>{messages.map((m) => <li key={m._id || m.createdAt}>{m.from}: {m.text}</li>)}</ul>
        </>
      )}
    </div>
  );
}

📸 Screenshots / GIFs

(Add yours here once running — examples)

🖼️ Chat interface with real-time messages

🟢 User joins and presence updates

⌨️ Typing indicator in action

🚀 Deployment

Backend → Render, Railway, or Heroku

Frontend → Vercel, Netlify, or GitHub Pages

Update CORS and .env URLs accordingly.

🧾 License

This project is developed as part of the Week 5: Real-Time Communication with Socket.io assignment under the PLP Web Technologies module.