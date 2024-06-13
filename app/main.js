const net = require("net");


console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const request = data.toString();
    const [firstLine, ...headers] = request.split('\r\n');
    const path = firstLine.split(" ")[1];

    if (path === '/') {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.includes("/echo/")) {
      const content = path.split('/echo/')[1];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
    } else if (path === '/user-agent') {
      const userAgentHeader = headers.find(header => header.startsWith('User-Agent:'));
      if (userAgentHeader) {
        const userAgent = userAgentHeader.split('User-Agent: ')[1];
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
      } else {
        socket.write("HTTP/1.1 400 Bad Request\r\n\r\nNo User-Agent header found");
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");
