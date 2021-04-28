const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const seen = document.getElementById("seen")
//get username and the room using qs,
const{username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

socket.emit ("joinRoom", {username, room});

//get room Users
socket.on("roomUsers", ({room, users}) =>{
  outputRoomName(room);
  outputUsers(users);
});


//msg from server
socket.on("message", message => {
  console.log(message);
  outputMessage(message);

  //auto scrolling
  chatMessages.scrollTop = chatMessages.scrollHeight;
});



//message submit
chatForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  //get the text to be sent
  const msg = e.target.elements.msg.value;

  //emit msg to the server.
  // socket.emit("chatMessage", msg);

  socket.emit("chatMessage", msg, function(confirm){
    if(confirm){
      div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML=`<i class="fas fa-check-circle"></i>`
      document.querySelector(".chat-messages").appendChild(div);
    }
  });

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus;
});


function outputMessage(message){
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username + " "}<span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>
  <br>
  <i id=i class="far fa-check-circle"></i>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room){
  roomName.innerText = room;
}

function outputUsers(users){
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join("")}`;
}
