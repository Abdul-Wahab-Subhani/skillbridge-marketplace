let io;

/**
 * Initializes Socket.io on the given HTTP server.
 * Clients join a room named after their user ID (sent on connection)
 * so we can push targeted updates without broadcasting to everyone.
 */
const initSocket = (server, corsOrigin) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => io;

/**
 * Emits an event to a specific user's room (used for status updates,
 * new requests, and chat messages).
 */
const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user_${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser };
