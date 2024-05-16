const friendname = document.getElementById("friend-name");
const username = document.getElementById("user-name");
const form = document.getElementById("chat-form");
const chatmessages = document.querySelector(".chat-messages");
const leave_btn = document.getElementById("leave-btn");

username.innerText = window.location.search
  .split("?")[1]
  .split("&")[0]
  .split("=")[1];
friendname.innerText = window.location.search
  .split("?")[1]
  .split("&")[1]
  .split("=")[1];

leave_btn.addEventListener("click", () => {
  history.back();
});
const socket = io();
socket.emit("join-pvt", {
  username: username.innerText,
  friendname: friendname.innerText,
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const mesg = e.target.elements.msg.value;
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  socket.emit("chat-pvt", {
    From: username.innerText,
    To: friendname.innerText,
    message: mesg,
  });
});

socket.on("message", (message) => {
  outputmsg(message);
  chatmessages.scrollTop = chatmessages.scrollHeight;
});

function outputmsg(msg) {
  console.log(msg);
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg["username"]} <span>${msg["time"]}</span></p>
        <p class="text">
          ${msg["message"]}
        </p>`;
  chatmessages.appendChild(div);
}
