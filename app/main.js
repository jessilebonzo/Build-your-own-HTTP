const net = require("net");


const server = net.createServer((socket) => {
  
  socket.on("data", (data) => {
    const request = data.toString();
    if (request.startsWith('GET /')) {
      const httpResponse = 'HTTP/1.1 200 OK\r\n\r\n';
          socket.write(httpResponse);
      } else {
        const httpResponse = 'HTTP/1.1 404 NOT FOUND\r\n\r\n';
          socket.write(httpResponse);
    }
    socket.end();
    
  });
});

server.listen(4221, "localhost", () => {
  process.stdout.write("Listening on localhost:4221");
});

