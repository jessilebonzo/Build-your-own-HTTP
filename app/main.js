const fs = require("fs");
const net = require("net");
const zlib = require('zlib');

const HTTP_OK = "HTTP/1.1 200 OK\r\n";
const HTTP_NOT_FOUND = "HTTP/1.1 404 Not Found\r\n\r\n";
const HTTP_CREATED = "HTTP/1.1 201 Created\r\n\r\n";

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });
    socket.on("data", (data) => {
        handleData(socket, data);
    });
});

server.listen(4221, "localhost");

function handleData(socket, data) {
    const requestLineItems = parseRequestLine(data);
    const currentPath = requestLineItems['path'];
    const currentMethod = requestLineItems['method'];

    if (currentPath === '/') {
        writeSocketMessage(socket, HTTP_OK);
    } else if (currentPath.startsWith('/echo')) {
        const bodyContent = currentPath.split('/')[2];
        const bodyContentLength = Buffer.byteLength(bodyContent);

        const encodingMethods = getEncodingMethods(data);
        let response = '';

        if (encodingMethods.includes('gzip')) {
            const bodyEncoded = zlib.gzipSync(bodyContent);
            const bodyEncodedLength = Buffer.byteLength(bodyEncoded);

            response = `${HTTP_OK}Content-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${bodyEncodedLength}\r\n\r\n`;
            socket.write(response);
            socket.write(bodyEncoded);
            socket.end();
        } else {
            response = `${HTTP_OK}Content-Type: text/plain\r\nContent-Length: ${bodyContentLength}\r\n\r\n${bodyContent}`;
            writeSocketMessage(socket, response);
        }
    } else {
        writeSocketMessage(socket, HTTP_NOT_FOUND);
    }
}

function parseRequestLine(data) {
    const request = data.toString();
    const lines = request.split('\r\n');
    const method = lines[0].split(" ")[0];
    const path = lines[0].split(" ")[1];
    return {'method': method, 'path': path};
}

function getEncodingMethods(data) {
    const request = data.toString();
    const lines = request.split('\r\n');
    const acceptEncodingHeader = lines.find(line => line.toLowerCase().startsWith('accept-encoding'));
    if (acceptEncodingHeader) {
        const encodingMethods = acceptEncodingHeader.split(": ")[1].split(", ");
        return encodingMethods;
    }
    return [];
}

function writeSocketMessage(socket, message) {
    socket.write(message);
    socket.end();
}
