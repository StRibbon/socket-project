var ioMiddleware = function(session) {

  return function(socket, next) {
    session(socket.handshake, {}, next);
  };
};

module.exports = ioMiddleware;