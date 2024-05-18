// requiring files
const { app, server } = require(`${__dirname}/app.js`);
const mongoose = require("mongoose");
const socketio = require("socket.io");
const formatmsg = require(`${__dirname}/utils/formatmsg.js`);
const {
  joinuser,
  getallusers,
  removeanuser,
  getcurrentuser,
} = require(`${__dirname}/utils/joinuser.js`);
const Data = require(`${__dirname}/Models/messagesModel.js`);
const pvtData = require(`${__dirname}/Models/pvtMessagesModel.js`);
const messagesFunctions = require(`${__dirname}/utils/messagesfunctions.js`);

// setting config.env
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config.env` });

// Connecting Database
const db = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASS
);
mongoose.connect(db).then(() => {
  console.log("Database connected");
});

const io = socketio(server);
io.on("connection", (socket) => {
  socket.on("join-room", (obj) => {
    const cuser = joinuser(socket.id, obj.username, obj.roomcode, obj.roomname);
    socket.join(cuser.roomcode);
    const xyz = async () => {
      const allMsgs = await messagesFunctions.getAllMessages(cuser.roomcode);
      allMsgs.forEach((msg) => {
        socket.emit("message", {
          username: msg.From,
          message: msg.Content,
          time: msg.Time,
        });
      });
    };
    xyz();
    socket.emit(
      "message",
      formatmsg("Bot", `Welcome to chat-cord ${cuser.username}`)
    );
    socket.broadcast
      .to(cuser.roomcode)
      .emit("message", formatmsg("Bot", `${cuser.username} is connected`));

    io.to(cuser.roomcode).emit("users-info", getallusers(cuser.roomcode));

    socket.on("disconnect", () => {
      removeanuser(socket.id);
      socket.broadcast
        .to(cuser.roomcode)
        .emit(
          "message",
          formatmsg("Bot", `${cuser.username} has left the chat`)
        );
      io.to(cuser.roomcode).emit("users-info", getallusers(cuser.roomcode));
    });
  });

  socket.on("join-pvt", (obj) => {
    const xyz = async () => {
      const allMsgs = await messagesFunctions.getAllPvtMessages(obj);
      allMsgs.forEach((msg) => {
        socket.emit("message", {
          username: msg.From,
          message: msg.Content,
          time: msg.Time,
        });
      });
    };
    xyz();
    socket.join(obj.username);
  });
  socket.on("chat-pvt", async (obj) => {
    const formattedmsg = formatmsg(obj.From, obj.message);
    const xyz = await pvtData.create({
      Time: formattedmsg.time,
      From: obj.From,
      To: obj.To,
      Content: obj.message,
    });
    io.to(obj.To).emit("message", formattedmsg);
    io.to(obj.From).emit("message", formattedmsg);
  });
  socket.on("chat-message", async (msg) => {
    const user = getcurrentuser(socket.id);
    const formattedmsg = formatmsg(user.username, msg);
    const xyz = await Data.create({
      Time: formattedmsg.time,
      From: formattedmsg.username,
      Content: formattedmsg.message,
      Room: user.roomcode,
    });
    io.to(user.roomcode).emit("message", formattedmsg);
  });
});

// Start listening on specified port
server.listen(process.env.PORT, () => {
  console.log(`Server is listening to port ${process.env.PORT}`);
});
