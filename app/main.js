// Import necessary modules
const http = require('http');
const zlib = require('zlib');

// Create HTTP server
const server = http.createServer((req, res) => {
    // Parse Accept-Encoding header
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Check if gzip encoding is supported
    const supportsGzip = acceptEncoding.includes('gzip');
    
    // Set response headers
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', Buffer.byteLength('foo'));

    // If gzip encoding is supported, set Content-Encoding header
    if (supportsGzip) {
        res.setHeader('Content-Encoding', 'gzip');
    }
    
    // Send response
    res.writeHead(200);
    // If gzip encoding is supported, gzip the response body
    if (supportsGzip) {
        const gzip = zlib.createGzip();
        gzip.pipe(res);
        gzip.end('foo');
    } else {
        res.end('foo');
    }
});

// Start server
const port = 4221;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
