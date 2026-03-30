// driverSocket.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // When a driver emits their location
    socket.on('updateLocation', (data) => {
      // Broadcast to all other clients (e.g. students viewing map)
      socket.broadcast.emit('busUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
