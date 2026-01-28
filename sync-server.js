const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let globalOffset = 0; // offset para compensar drift del servidor

// WebSocket para enviar tiempo maestro a todos los clientes
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Envía tiempo maestro cada 1s
  /*const interval = setInterval(() => {
    const now = Date.now();
    ws.send(JSON.stringify({
      type: 'sync',
      serverTimeMs: now,
      globalOffset: globalOffset
    }));
  }, 1000);*/

  ws.on('close', () => {
    //clearInterval(interval);
    console.log('Client disconnected');
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'clientTime') {
      // Calcula offset entre cliente y servidor
      const serverTime = Date.now();
      globalOffset = (data.clientTime - serverTime) / 2; // simple estimación
    }
    if (data.type === 'getServerTime') {
      ws.send(JSON.stringify({
        type: 'serverTime',
        serverTime_ms: Date.now(),
        clientTime_ms: data.t1
      }));
    }
  });
});

// Sirve el HTML y archivos de audio
app.use(express.static('.'));

server.listen(8080, () => {
  console.log('Sync server on http://localhost:8080');
});
