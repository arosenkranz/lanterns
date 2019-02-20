
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`A user connected to: ${socket}`);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('new-lantern', (message) => {
      console.log(message);
    });
  });
};
