types = require("./types");
/**
 * @param {Buffer} data
 * @returns {string}
 */
function getRequestStartLine(data) {
    return data.toString().split("\r\n")[0];
}
/**
 * @param {Buffer} data
 * @returns {string}
 */
function getRequestPath(data) {
    const requestStartLine = getRequestStartLine(data);
    return requestStartLine.split(" ")[1];
}
/**
 * @param {Buffer} data
 * @return {types.Header[]}
 */
function getHeaders(data) {
    const rawHeaders = data.toString().split("\r\n").slice(1, -2);
    console.log(rawHeaders)
    const headers = [];
    rawHeaders.forEach((rawHeader) => {
        rawHeader = rawHeader.toLowerCase()
        const splittedHeader = rawHeader.split(": ");
        headers.push(new types.Header(splittedHeader[0], splittedHeader.slice(1).join("")));
    })
    console.log(headers)
    return headers;
}
/**
 * @param {Buffer} data
 * * @return {string}
 */
function getMethod(data) {
    const requestStartLine = getRequestStartLine(data);
    return requestStartLine.split(" ")[0];
}
/**
 * @param {Buffer} data
 * * @return {string}
 */
function getBody(data) {
    return data.toString().split("\r\n\r\n")[1];
}
module.exports = {
    "getRequestPath": getRequestPath,
    "getHeaders": getHeaders,
    "getMethod": getMethod,
    "getBody": getBody
};