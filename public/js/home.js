const createbtn = document.getElementById("createroom-btn");
const joinbtn = document.getElementById("join-btn");
const addfriendbtn = document.getElementById("addFriend-btn");
const roomname = document.getElementById("roomName");
const roomcode = document.getElementById("joinCode");
const friendemail = document.getElementById("friendEmail");
const pendinglist = document.getElementById("pendingList");
const allfriendslist = document.getElementById("allFriendsList");
const logout = document.getElementById("logout");

logout.addEventListener("click", async () => {
  const result = await axios.delete("/users/logout");
  window.location.href = "/login";
});
createbtn.addEventListener("click", async () => {
  if (roomname.value == "") {
    alert("Enter Room Name");
    return;
  }
  const result = await axios.post("/room/createRoom", {
    roomName: roomname.value,
  });
  window.location.href = `/chat?id=${
    window.location.search.split("=")[1]
  }&roomCode=${result.data.newRoom.roomCode}&roomName=${
    result.data.newRoom.roomName
  }`;
});

joinbtn.addEventListener("click", async () => {
  if (roomcode.value == "") {
    alert("Enter room code");
    return;
  }
  try {
    const result = await axios.post("/room/joinRoom", {
      roomCode: roomcode.value,
    });
    window.location.href = `/chat?id=${
      window.location.search.split("=")[1]
    }&roomCode=${result.data.currentRoom.roomCode}&roomName=${
      result.data.currentRoom.roomName
    }`;
  } catch (err) {
    alert(err.response.data.message);
  }
});
addfriendbtn.addEventListener("click", async () => {
  if (friendemail.value == "") {
    alert("Enter email");
    return;
  }
  try {
    const result = await axios.post("/mixed/sendRequest", {
      userEmail: friendemail.value,
    });
    alert(result.data.message);
    return;
  } catch (err) {
    alert(err.response.data.message);
  }
});

const pending = async () => {
  const result = await axios.get("/mixed/getFriendrequests");
  const arr = result.data.user;
  arr.forEach((ele) => {
    var temp = `<li class="friend-request">
    ${ele}<button onclick="acceptRequest('${ele}')">Accept</button
    ><button onclick="deleteRequest('${ele}')">Delete</button>
  </li>`;
    pendinglist.innerHTML += temp;
  });
};

const allfriend = async () => {
  const result = await axios.get("/mixed/getListOfFriends");
  const arr = result.data.user;
  arr.forEach((ele) => {
    var temp = `
    <li>
    ${ele}
    <button onclick="pvtchat('${ele}')">CHAT</button>
    </li>`;
    allfriendslist.innerHTML += temp;
  });
};

pending();
allfriend();

const acceptRequest = async (str) => {
  const result = await axios.post("/mixed/accept", {
    requestName: str,
  });
};
const deleteRequest = async (str) => {
  const result = await axios.post("/mixed/delete", {
    requestName: str,
  });
};

const pvtchat = (ele) => {
  const id = window.location.search.split("?")[1].split("=")[1];
  axios.get(`/users/${id}`).then((r) => {
    window.location.href = `/pvtmsg?username=${r.data.cuser[0].userName}&friendname=${ele}`;
  });
};
