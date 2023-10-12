import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

const app = express();

//1. create server
const server = http.createServer(app);

//2. create socket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//3. use socket events

io.on("connection", (socket) => {
  console.log("connection is established");
  socket.on("join", (userName) => {
    socket.userName = userName;
  });
  socket.on("new_message", (message) => {
    let userMsg = {
      userName: socket.userName,
      message: message,
    };
    //broadcast the message to all the clients
    socket.broadcast.emit("broadcast_message", userMsg);
  });
  socket.on("disconnect", () => {
    console.log("connection is disconnected");
  });
});

server.listen(3000, () => {
  console.log("app is listening in port : 3000");
});
