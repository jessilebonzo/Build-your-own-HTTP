routes = require("./routes.js")
request = require("./request.js")
net = require("net")
/**
 * @param {Buffer} data
 * @returns {string}
 */
function handleData(data) {
    const url = request.getRequestPath(data);
    const method = request.getMethod(data)
    const headers = request.getHeaders(data);
    const handler = routes.getHandler(url, method);
    let statusData = "HTTP/1.1 "
    let headersData = ""
    const response = handler(data)
    statusData = statusData.concat(`${response.status.code} ${response.status.message}`)
    response.headers.forEach(header => {
        headersData = headersData.concat(`${header.name}: ${header.value}\r\n`)
    })
    const encodingHeader = headers.find(header => header.name === "accept-encoding")
    console.log(encodingHeader)
    if (encodingHeader !== undefined && encodingHeader.value === "gzip") {
        headersData = headersData.concat(`Content-Encoding: ${encodingHeader.value}\r\n`)
        // response.body = Buffer.from(response.body).toString("base64")
    }
    const result = [statusData, headersData, response.body]
    return result.join("\r\n");
}
/**
 * @param {net.Socket} socket
 */function getListener(socket) {
    return (data) => {
        const responseData = handleData(data);
        console.log(responseData)
        socket.write(responseData);
    }
}
module.exports = {"getListener": getListener};
