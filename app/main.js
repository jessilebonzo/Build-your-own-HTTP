const net = require("net");
const fs = require("fs");
const path = require("path");
const { parseData, parseArgs, formatRes, simpleRes, HTTP_CODES } = require("./utils");
const zlib = require("zlib");
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.setEncoding("utf8");
  socket.on("close", () => {
    socket.end();
  });
  socket.on("data", (data) => {
    const req = parseData(data);
    const args = parseArgs(process.argv);
    console.log(req);
    switch (req.method) {
        case "GET":
            if (req.endpoint === "echo") {
                if (req.encoding === "gzip") {
                    const body = zlib.gzipSync(req.getBody);
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n`);
                    socket.write(body);
                    break;
                }
                socket.write(formatRes([HTTP_CODES.OK, req.encoding, "text/plain", req.getBody]));
                break;
            }
            if (req.endpoint === "user-agent") {
                socket.write(formatRes([HTTP_CODES.OK,,"text/plain", req.agent]));
                break;
            }
            if (req.endpoint === "files") {
                if (args.directory.index === -1) {
                    socket.write(simpleRes(HTTP_CODES.SERVER_ERR));
                    break;
                }
                const filePath = path.join(args.directory.value, req.getBody);
                if (!fs.existsSync(filePath)) {
                    socket.write(simpleRes(HTTP_CODES.NOT_FOUND));
                    break;
                }
                const body = fs.readFileSync(filePath).toString("utf-8");
                socket.write(formatRes([HTTP_CODES.OK,, "application/octet-stream", body]));
                break;
            }
            if (req.path === "/") {
                socket.write(simpleRes(HTTP_CODES.OK));
                break;
            }
            socket.write(simpleRes(HTTP_CODES.NOT_FOUND));
            break;
        case "POST":
            if (req.endpoint === "files") {
                if (args.directory.index === -1) {
                    socket.write(simpleRes(HTTP_CODES.SERVER_ERR));
                    break;
                }
                const filePath = path.join(args.directory.value, req.getBody);
                fs.writeFileSync(filePath, req.postBody, "utf-8");
                socket.write(formatRes([HTTP_CODES.CREATED,, "application/octet-stream", req.postBody]));
                break;
            }
            socket.write(simpleRes(HTTP_CODES.NOT_FOUND));
            break;
        default:
            socket.write(simpleRes(HTTP_CODES.NOT_FOUND));
            break;
    }
    socket.end();
  });
});
server.listen(4221, "localhost");