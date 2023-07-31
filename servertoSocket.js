import express from "express";
import { createServer } from "http";
import { readFileSync } from "fs";
import { Server } from "socket.io";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const options = {
//   // key: fs.readFileSync("./src/ssl/cert.key"),
//   // cert: fs.readFileSync("./src/ssl/cert.crt"),
//   key: readFileSync(join(__dirname, "src/ssl/cert.key")),
//   cert: readFileSync(join(__dirname, "src/ssl/cert.crt")),
// };
let USERCOUNT = 3;
const server = createServer();
const io = new Server(server, { cors: true });

io.on("connection", (socket) => {
  // 当用户在房间发送信息时，不做任何处理，只是把信息转发给房间里的其他人
  socket.on("message", (room, data) => {
    console.log("收到客户端发送信息", room, data, socket.id);
    // socket.to(room).emit("message", room, data, socket.id); // 给房间里除了自己的其他人发消息
    socket.emit("message", room, data, socket.id); // 给房间里除了自己的其他人发消息
  });
  socket.on("join", (message) => {
    // console.log(message);

    // 加入房间
    socket.join(message.room);
    // 获取房间，并且知道房间里有多少人（如果没有找到这个房间，会自己创建一个房间）
    let myRoom = io.sockets.adapter.rooms.get(message.room);
    // console.log(myRoom.size);
    if (myRoom.size < USERCOUNT) {
      socket.emit("joined", message, socket.id); // 给自己发事件
      // 如果房间人数大于1时，就给房间里除了自己的其他人发事件
      if (myRoom.size > 1) {
        socket.to(message.room).emit("otherjoin", message, socket.id);
      }
    } else {
      // 超过三个人时，就T出去
      socket.leave(message.room);
      socket.emit("full", message, socket.id);
    }
  });
  socket.on("leave", (message) => {
    // 当对端离开房间;
    socket.to(message.room).emit("bye", message, socket.id); // 给房间里除了自己的其他人发消息
    socket.emit("leaved", message, socket.id); // 给自己发事件
  });
});
const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
