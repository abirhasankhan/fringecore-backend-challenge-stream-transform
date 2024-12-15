import net from 'node:net';

// Define the secret phrase to hide
const SECRET = "i like big trains and i cant lie";
const SECRET_REGEX = new RegExp(SECRET, 'g');

// Create a TCP server for the proxy
const proxyServer = net.createServer((clientConn) => {
    // Establish a connection to the origin server
    const originConn = net.createConnection(3032, 'localhost', () => {
        console.log('Connected to origin server');
        // Pipe data from the client to the origin server
        clientConn.pipe(originConn);
    });

    // Handle data from the origin server
    originConn.on('data', (data) => {
        // Replace the secret phrase with dashes
        let modifiedData = data.toString().replace(SECRET_REGEX, '-'.repeat(SECRET.length));

        // Send the modified data to the client
        clientConn.write(modifiedData);
    });

    // Handle client disconnection
    clientConn.on('end', () => {
        console.log('Client disconnected');
        originConn.end();  // Close connection to the origin server
    });

    // Handle error on client connection
    clientConn.on('error', (err) => {
        console.error('Client error:', err);
        originConn.destroy();
    });

    // Handle error on origin server connection
    originConn.on('error', (err) => {
        console.error('Origin server error:', err);
        clientConn.destroy();
    });
});

// Start the proxy server on port 3031
proxyServer.listen(3031, () => {
    console.log('Proxy server started on port 3031');
});
