const fs = require("fs");
const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    const req = data.toString();
    console.log(req);
    const [firstLine, ...headers] = req.split("\r\n");
    const [method, path] = firstLine.split(" ");

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/files/")) {
      const directory = process.argv[2];
      const filename = path.split("/files/")[1];
      const filePath = `${directory}/${filename}`;
      
      if (method === "GET") {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
          socket.write(res);
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } else if (method === "POST") {
        const body = req.split("\r\n\r\n")[1];
        fs.writeFileSync(filePath, body);
        socket.write("HTTP/1.1 201 CREATED\r\n\r\n");
      }
    } else if (path === "/user-agent") {
      const userAgentHeader = headers.find(header => header.startsWith("User-Agent:"));
      if (userAgentHeader) {
        const userAgent = userAgentHeader.split(": ")[1];
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
      } else {
        socket.write("HTTP/1.1 400 Bad Request\r\n\r\nNo User-Agent header found");
      }
    } else if (path.startsWith("/echo/")) {
      const res = path.split("/echo/")[1];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${res.length}\r\n\r\n${res}`);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
});

server.listen(4221, "localhost");
