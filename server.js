import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";

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
    chatModel
      .find()
      .sort({ timestamp: 1 })
      .limit(50)
      .then((messages) => {
        socket.emit("load_messages", messages);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  socket.on("new_message", (message) => {
    let userMsg = {
      userName: socket.userName,
      message: message,
    };

    const newChat = new chatModel({
      userName: socket.userName,
      message: message,
      timestamp: new Date(),
    });
    newChat.save();
    //broadcast the message to all the clients
    socket.broadcast.emit("broadcast_message", userMsg);
  });
  socket.on("disconnect", () => {
    console.log("connection is disconnected");
  });
});

server.listen(3000, () => {
  console.log("app is listening in port : 3000");
  connect();
});
