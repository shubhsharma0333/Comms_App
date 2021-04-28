const path = require("path");
const http = require ("http");
const express = require ("express");
const socketio = require ("socket.io");
const formatMessage = require("./mics/message");
const {userJoin , getCurrentUser, getRoomUsers, userLeave} = require("./mics/user.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "COMMS BOT";

app.use(express.static(path.join(__dirname, "public")));

//runs when a new clients gets connected
io.on('connection', socket => {
  socket.on("joinRoom", ({username, room}) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room);                                   //socket.io function to join room.


    // TO welcome the user.
     socket.emit("message", formatMessage(botName, "welcome to comms!" ));

     //when a user connects, broadcast.
     socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat` ));

     //the users present in the room.
     io.to(user.room).emit("roomUsers",{
       room: user.room,
       users: getRoomUsers(user.room)
     });

  });

  //listen for chat chatMessages
  socket.on("chatMessage", (msg,fn) =>{
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    io.to(user.room).emit("messageSucces", msg);            //for tick to go blue
    fn(true);
  });


  //when a client disconnects.
  socket.on("disconnect", ()=>{
    const user = userLeave(socket.id);
    if(user){
      io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat` ));

      //the users present in the room.
      io.to(user.room).emit("roomUsers",{
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});


const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log("Server is running successfully"));
