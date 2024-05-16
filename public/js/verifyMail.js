const id = window.location.search.split("?")[1].split("=")[1];
axios.get(`/users/${id}`).then((r) => {
  if (r.data.cuser[0].verified) {
    document.getElementById("verification-status").innerText =
      "Your Email has been verified";
  }
});
