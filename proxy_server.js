const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Connect to the actual ROS server
  const rosServer = new WebSocket('ws://YOUR_ACTUAL_ROS_SERVER_IP:9090');

  // Pipe messages between the proxy and ROS server
  ws.on('message', (message) => rosServer.send(message));
  rosServer.on('message', (message) => ws.send(message));

  // Handle any necessary cleanup on disconnect
  ws.on('close', () => {
    // Add cleanup code if needed
  });
});

// Start the proxy server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
