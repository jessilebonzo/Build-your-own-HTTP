const net = require("net");
const process = require("process");
const fs = require("node:fs/promises")
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// function buildResponse(response) {
//     const responseHeaders = []
//     response.headers.forEach((value) => { responseHeaders.push(value.join(": ")) })
//     return `${response.protocol} ${response.code}\r\n${responseHeaders.join("\r\n")}\r\n\r\n${response.content}`
// }
const arguments = process.argv
let filepath = ""
if (arguments.includes("--directory")) {
    filepath = arguments[arguments.indexOf("--directory") + 1]
}
const server = net.createServer((socket) => {
    socket.on('data', async (buffer) => {
        const [requestStatus, requestContent] = buffer.toString('utf-8').split("\r\n\r\n")
        const [requestMethod, requestPath, requestProtocol] = requestStatus.split(" ")
        let requestHeaders = []
        requestStatus.split("\r\n").forEach((value) => {
            requestHeaders.push(value.toLowerCase().split(": "))
        })
        // let response = {
        //     protocol: "HTTP/1.1",
        //     code: "404 Not Found",
        //     headers: [
        //         ["content-type", "text/plain"],
        //         ["content-length", 0],
        //     ],
        //     content: ""
        // }
        if (requestPath === "/") {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n`)
            return
        }
        if (requestPath.startsWith("/echo/")) {
            const echoString = requestPath.replace("/echo/", "")
            let acceptEncoding = null
            for (const header of requestHeaders) {
                if (header[0] === "accept-encoding" && header[1].includes("gzip")) {
                    acceptEncoding = "gzip"
                    break
                }
            }
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n${acceptEncoding ? `Content-Encoding: ${acceptEncoding}\r\n` : ""}Content-Length: ${echoString.length}\r\n\r\n${echoString}`)
            return
        }
        if (requestPath === "/user-agent") {
            let userAgent = ""
            for (const header of requestHeaders) {
                if (header[0] === "user-agent") {
                    userAgent = header[1]
                    break
                }
            }
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
            return
        }
        if (filepath !== "" && requestPath.startsWith("/files/") && requestMethod === "GET") {
            const filename = requestPath.replace("/files/", "")
            let stat
            try {
                stat = await fs.stat(filepath + filename)
            } catch (err) {
                socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n")
                return
            }
            const content = await fs.readFile(filepath + filename)
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${stat.size}\r\n\r\n`)
            socket.write(content)
            return
        }
        if (filepath !== "" && requestPath.startsWith("/files/") && requestMethod === "POST") {
            const filename = requestPath.replace("/files/", "")
            await fs.writeFile(filepath + filename, requestContent)
            socket.write(`HTTP/1.1 201 Created\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n`)
            return
        }
        socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n")
    })
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");