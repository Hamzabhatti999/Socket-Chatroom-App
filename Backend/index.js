const http = require("http");
const { Server } = require("socket.io");
const app = http.createServer();
const PORT = 8000;
const io = new Server(app, {
  cors: { origin: "*" },
  addTrailingSlash: false,
});

let users = [];
const rooms = {};
const privateChats = [];
const messagesByRoom = {};

io.on("connection", (socket) => {
  console.log("..... socket initializing ........");
  socket.on("create-user", (data) => {
    const { name } = data;
    const newUser = {
      id: socket.id,
      name: name,
    };
    users.push(newUser);
    io.emit("user-list", users);
  });
  socket.on("sent-msg", (data) => {
    const { to, from, text } = data;
    const sender = users.find((val) => val.id === from);
    const receiver = users.find((val) => val.id === to);
    let msg = {
      senderName: sender.name,
      senderId: from,
      receiverName: receiver.name,
      receiverId: to,
      msg: text,
    };
    privateChats.push(msg);
    io.emit("new-msg", msg);
    socket.to(to).emit("new-msg", msg);
  });
  socket.on("create-room", (data) => {
    const { name } = data;
    const roomId = `room-${Date.now()}`;
    rooms[roomId] = {
      name: name,
      users: [socket.id],
    };
    socket.join(roomId);
    io.emit(
      "room-list",
      Object.keys(rooms).map((id) => ({
        id,
        name: rooms[id].name,
        users: rooms[id].users,
      }))
    );
  });
  socket.on("get-user-and-rooms", () => {
    io.emit("user-list", users);
    const roomList = Object.keys(rooms).map((id) => ({
      id,
      name: rooms[id].name,
      users: rooms[id].user,
    }));
    io.emit("room-list", roomList);
  });
  socket.on("get-thread", (data) => {
    let to = data.to;
    let from = data.from;
    let conversations = privateChats.filter(
      (message) =>
        (message.senderId === to && message.receiverId === from) ||
        (message.senderId === from && message.receiverId === to)
    );
    io.emit("conversation", conversations);
  });
  socket.on("join-room", (data) => {
    const { roomId } = data;
    if (rooms[roomId]) {
      rooms[roomId].users.push(socket.id);
      socket.join(roomId);
      let user = users.find((val) => val.id === socket.id);
      const text = `${user.name} joined ${rooms[roomId].name}`;
      const notification = {
        message: text,
        senderId: "system",
        senderName: "System",
        timestamp: new Date().toISOString(),
      };
      if (!messagesByRoom[roomId]) {
        messagesByRoom[roomId] = [];
      }
      messagesByRoom[roomId].push(notification);
      io.emit(
        "room-list",
        Object.keys(rooms).map((id) => ({
          id,
          name: rooms[id].name,
          users: rooms[id].users,
        }))
      );
      io.to(roomId).emit("notify", {
        text: ` ${user.name} joined ${rooms[roomId].name}`,
      });
    } else {
      console.log("Room not found");
    }
  });

  socket.on("send-room-message", (data) => {
    const { roomId, message, senderId } = data;
    const sender = users.find((val) => val.id === senderId);
    const msg = {
      message,
      senderId,
      senderName: sender.name,
      timestamp: new Date().toISOString(),
    };
    if (!messagesByRoom[roomId]) {
      messagesByRoom[roomId] = [];
    }
    messagesByRoom[roomId].push(msg);
    io.to(roomId).emit("receive-message", msg);
  });
  socket.on("leave-room", (data) => {
    const { roomId, userId } = data;
    rooms[roomId].users = rooms[roomId].users.filter((item) => item !== userId);
    let user = users.find((val) => val.id === userId);

    io.emit(
      "room-list",
      Object.keys(rooms).map((id) => ({
        id,
        name: rooms[id].name,
        users: rooms[id].users,
      }))
    );
    const text = `${user.name} left ${rooms[roomId].name}`;
    if (!messagesByRoom[roomId]) {
      messagesByRoom[roomId] = [];
    }
    messagesByRoom[roomId].push(text);
    const notification = {
      message: text,
      senderId: "system",
      senderName: "System",
      timestamp: new Date().toISOString(),
    };
    if (!messagesByRoom[roomId]) {
      messagesByRoom[roomId] = [];
    }
    messagesByRoom[roomId].push(notification);
    io.to(roomId).emit("notify", {
      text,
    });
  });
  socket.on("fetch-messages", (data) => {
    const messages = messagesByRoom[data.roomId] || [];
    io.emit("room-messages", messages);
  });
  socket.on("typing", (data) => {
    const { to, from } = data;
    const typer = users.find((val) => val.id === from);
    io.in(to).emit("user-typing", { name: typer.name });
  });
  socket.on("room-typing", (data) => {
    const { userId, roomId } = data;
    const typer = users.find((val) => val.id === userId);
    io.to(roomId).emit("user-typing", { name: typer.name, id: socket.id });
  });
  socket.on("disconnect", () => {
    console.log("----- socket disconnected -----");
    users = users.filter((user) => user.id !== socket.id);
    io.emit("user-list", users);
    Object.keys(rooms).forEach((roomId) => {
      rooms[roomId].users = rooms[roomId].users.filter(
        (userId) => userId !== socket.id
      );
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    });
    io.emit(
      "room-list",
      Object.keys(rooms).map((id) => ({ id, name: rooms[id].name }))
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is Running at http://localhost:${PORT}`);
});
