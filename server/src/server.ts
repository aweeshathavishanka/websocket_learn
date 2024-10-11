import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocket, WebSocketServer } from "ws";

dotenv.config();
const app = express();
app.use(cors());

// Create Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Create new websocket connection
wss.on("connection", (ws: WebSocket) => {
  console.log("New Client Connected");

  ws.on("message", (data) => {
    console.log("Received a message from client: " + data);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client Disconnected");
  });
});

// Port
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
