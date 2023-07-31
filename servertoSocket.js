import express from "express";
const app = express();
const http = import("http").createServer(app);
const io = import("socket.io")(http);

const port = 3000; // Replace with the desired port number

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("candidate", (candidate) => {
    socket.broadcast.emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
