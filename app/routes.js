const {getHeaders, getRequestPath, getBody} = require("./request");
const {directoryArg} = require("./cli-args");
const fs = require("fs")
types = require("./types");
request = require("./request");
/**
 * @type {Object<string, Function<Buffer, Response>>}
 */
let routes = {}
/**
 * @param {string} route
 * @param {Function<Buffer, Response>} handler
 * @param {string} method
 */
function addRoute(route, handler, method = "GET") {
    routes[method + route] = handler;
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
const notFoundHandler = (data) => {
    return new types.Response(
        new types.StatusCode(404, "Not Found"),
        [],
        ""
    )
}
/**
 * @param {string} url
 * @param {string} method
 * @return {Function<Buffer, Response>}
 */
function getHandler(url, method) {
    const routeKey = `${method}${url}`
    let handler = routes[routeKey];
    if (handler === undefined) {
        for (const handlerKey in routes) {
            if (handlerKey.endsWith("{}") && routeKey.startsWith(handlerKey.slice(0, -3))) {
                return routes[handlerKey];
            }
        }
        return notFoundHandler
    }
    return handler;
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
const indexHandler = (data) => {
    return new types.Response(
        new types.StatusCode(200, "OK"),
        [],
        ""
    );
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
function echoHandler(data) {
    const url = getRequestPath(data);
    const dataToEcho = url.split("/echo/")[1]
    return new types.Response(
        new types.StatusCode(200, "OK"),
        [
            new types.Header("Content-Type", "text/plain"),
            new types.Header("Content-Length", dataToEcho.length)
        ],
        dataToEcho
    );
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
const useragentHandler = (data) => {
    const headers = getHeaders(data)
    const userAgentHeader = headers.find(header => header.name === "user-agent")
    return new types.Response(
        new types.StatusCode(200, "OK"),
        [
            new types.Header("Content-Type", "text/plain"),
            new types.Header("Content-Length", userAgentHeader.value.length)
        ],
        userAgentHeader.value
    );
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
const filesGetHandler = (data) => {
    const url = getRequestPath(data);
    const path = url.split("/files/")[1]
    const filePath = `${directoryArg}/${path}`
    console.log(filePath)
    try {
        const body = fs.readFileSync(filePath)
        return new types.Response(
            new types.StatusCode(200, "OK"),
            [
                new types.Header("Content-Type", "application/octet-stream"),
                new types.Header("Content-Length", body.length)
            ],
            body
        )
    } catch (error) {
        console.log(error)
        return new types.Response(
            new types.StatusCode(404, "Not Found"),
            [],
            ""
        )
    }
}
/**
 * @param {Buffer} data
 * @returns {types.Response}
 */
const filesPostHandler = (data) => {
    const url = getRequestPath(data);
    const path = url.split("/files/")[1]
    const filePath = `${directoryArg}/${path}`
    const body = getBody(data)
    fs.writeFileSync(filePath, body)
    return new types.Response(
        new types.StatusCode(201, "Created"),
        [],
        ""
    )
}
addRoute(
    "/", indexHandler
)
addRoute("/user-agent", useragentHandler)
addRoute(
    "/echo/{}", echoHandler
)
addRoute(
    "/files/{}", filesGetHandler
)
addRoute(
    "/files/{}", filesPostHandler, "POST"
)
module.exports = {
    "getHandler": getHandler
}