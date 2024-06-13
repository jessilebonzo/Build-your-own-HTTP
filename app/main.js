const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const [requestLine] = request.split('\r\n');
    const [method, path] = requestLine.split(' ');

    if (method === 'GET' && path === '/') {
      const httpResponse = 
        'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        'Content-Length: 13\r\n' +
        '\r\n' +
        'Hello, world!';
      socket.write(httpResponse);
    } else {
      const httpResponse = 
        'HTTP/1.1 404 NOT FOUND\r\n' +
        'Content-Type: text/plain\r\n' +
        'Content-Length: 9\r\n' +
        '\r\n' +
        'Not Found';
      socket.write(httpResponse);
    }
    socket.end();
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

server.listen(4221, "localhost", () => {
  console.log("Listening on localhost:4221");
});

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
});
