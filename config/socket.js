import { Server } from 'socket.io';
import ChatMessage from '../models/chatMessage.js';

let io;

const setupSocket = (server) => {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      // Handle user joining a chat room
      socket.on('joinRoom', (userId) => {
        console.log(`Received joinRoom event with userId: ${userId}`);
        socket.join(userId);
        console.log(`User ${userId} joined the room`);
    });
      // Handle chat messages
      socket.on('chatMessage', async (message) => {
        const { sender, recipient, text } = message;

        try {

          const chatMessage = new ChatMessage({
            sender,
            recipient,
            message: text
          });

          await chatMessage.save();

          io.to(recipient).emit('chatMessage', chatMessage);
          io.to(sender).emit('chatMessage', chatMessage);


        } catch (error) {
          console.error('Error saving or sending message:', error);
        }
      });


      socket.on('callRequest', ({ signal, to }) => {
        console.log(`Call request from ${socket.id} to ${to}`);
        io.to(to).emit('callRequest', { from: socket.id, signal });
    });

    socket.on('answer', ({ signal, to }) => {
        console.log(`Answer received from ${socket.id} to ${to}`);
        io.to(to).emit('answer', signal);
    });

    socket.on('endCall', ({ to }) => {
        console.log(`Call ended by ${socket.id} for ${to}`);
        io.to(to).emit('endCall');
    });

   
    socket.on('signal', (data) => {
        const { signal, to } = data;
        console.log(`Signal sent from ${socket.id} to ${to}`);
        io.to(to).emit('signal', { signal, from: socket.id });
    });

    socket.on('iceCandidate', ({ candidate, to }) => {
      if (users[to]) {
        users[to].emit('iceCandidate', { candidate, from: userId });
      }
    });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    return io;
};

export { setupSocket, io };
