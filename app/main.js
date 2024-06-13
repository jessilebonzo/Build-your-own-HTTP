const net = require("net");
const headers = request.split(' ')[1];

console.log("Logs from your program will appear here!");
const server = net.createServer((socket) => {

  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const path = data.toString().split(" ")[1];
    
    if (path === '/') {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.includes("/echo/")) {
      const content = path.split('/echo/')[1];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
    }else if(url == "/user-agent"){
      const userAgent = headers[2].split('User-Agent: ')[1];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");
