const chatmessages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const userslist = document.getElementById("users");
const leave_btn = document.getElementById("leave-btn");

const roomName = document.getElementById("room-name");
const roomCode = document.getElementById("room-code");
const userName = document.getElementById("user-name");

const id = window.location.search.split("?")[1].split("&")[0].split("=")[1];
leave_btn.addEventListener("click", () => {
  window.location.href = `/home?id=${id}`;
});
const roomname = window.location.search
  .split("?")[1]
  .split("&")[2]
  .split("=")[1];
const roomcode = window.location.search
  .split("?")[1]
  .split("&")[1]
  .split("=")[1];
roomName.innerText = roomname;
roomCode.innerText = roomcode;

axios.get(`/users/${id}`).then((r) => {
  userName.innerText = r.data.cuser[0].userName;
  socket.emit("join-room", {
    username: userName.innerText,
    roomcode: roomCode.innerText,
    roomname: roomName.innerText,
  });
});

const socket = io();

socket.on("message", (message) => {
  outputmsg(message);
  chatmessages.scrollTop = chatmessages.scrollHeight;
});

socket.on("users-info", (users) => {
  userslist.innerHTML = ``;
  users.forEach((element) => {
    const li = document.createElement("li");
    li.innerText = element.username;
    userslist.appendChild(li);
  });
});

function outputmsg(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg["username"]} <span>${msg["time"]}</span></p>
      <p class="text">
        ${msg["message"]}
      </p>`;
  chatmessages.appendChild(div);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const mesg = e.target.elements.msg.value;
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  socket.emit("chat-message", mesg);
});
