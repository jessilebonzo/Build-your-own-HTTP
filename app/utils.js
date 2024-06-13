const zlib = require("zlib");
const _HTTP_CODES = {
    OK: "200 OK",
    CREATED: "201 Created",
    NOT_FOUND: "404 Not Found",
    SERVER_ERR: "500 Internal Server Error"
}
const _simpleRes = (code, includeTrailer = true) => {
    return `HTTP/1.1 ${code}${includeTrailer ? "\r\n\r\n" : ""}`
}
const _parseData = (data) => {
    const dataObj = {
        "postBody": data.toString().split("\r\n\r\n")?.[1],
    };
    const validEncodings = ["gzip", "deflate"];
    const dataArr = data.toString().split("\r\n").filter((el) => el);
    dataArr.forEach((dataRow) => {
      const [header, value] = dataRow.split(": ");
        if (!value && header.includes("HTTP/1.1")) {
            const [method, path] = header.split(" ");
            const [, endpoint, args] = path.split("/");
            dataObj.method = method;
            dataObj.path = path;
            dataObj.endpoint = endpoint;
            dataObj.getBody = args;
            return;
        }
        if (header.startsWith("Host")) {
            dataObj.host = value;
        } else if (header.startsWith("Accept-Encoding")) {
            const encodings = value.split(", ");
            dataObj.encoding = encodings.filter((enc) => validEncodings.includes(enc)).join(", ");
        } else if (header.startsWith("Accept")) {
            dataObj.accept = value;
        } else if (header.startsWith("User-Agent")) {
            dataObj.agent = value;
        }
    });
    return dataObj;
}
const _parseArgs = (argv) => {
    const dirArgIndex = argv.findIndex((el) => el === "--directory");
    return {
        "directory": { index: dirArgIndex, value: argv[dirArgIndex + 1] },
    }
}
const _formatRes = ([httpCode, encoding, contentType, body, bodyLength]) => {
  return [`HTTP/1.1 ${httpCode}`, encoding ? `Content-Encoding: ${encoding}` : null, `Content-Type: ${contentType}`, `Content-Length: ${bodyLength ? bodyLength : body.length}`, "", body].filter((el) => el != null).join("\r\n");
}
Promise.resolve()
  module.exports = {
  parseData: _parseData,
  formatRes: _formatRes,
  parseArgs: _parseArgs,
  simpleRes: _simpleRes,
  HTTP_CODES: _HTTP_CODES
}