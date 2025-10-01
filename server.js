// Simple Socket.io server for development
// Run this with: node server.js

const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_join', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat`);
    socket.broadcast.emit('message', {
      id: Date.now().toString(),
      text: `${username} joined the chat`,
      sender: 'System',
      timestamp: new Date()
    });
  });

  socket.on('send_message', (message) => {
    console.log('Message received:', message);
    // Broadcast to all other clients
    socket.broadcast.emit('message', {
      id: Date.now().toString(),
      ...message
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      socket.broadcast.emit('message', {
        id: Date.now().toString(),
        text: `${socket.username} left the chat`,
        sender: 'System',
        timestamp: new Date()
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});