const signupform = document.getElementById("signup-form");
const loginform = document.getElementById("login-form");
const verifystatus = document.getElementById("verification-status");
if (signupform) {
  signupform.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    try {
      const result = await axios.post("/users/signup", {
        userName: name,
        userEmail: email,
        password: password,
        passwordConfirm: confirmPass,
      });
      alert(result.data.Message);
      window.location.href = `/verifyfirst?id=${result.data.newUser._id}`;
    } catch (err) {
      alert(err.response.data.message);
    }
  });
}
if (loginform) {
  loginform.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const result = await axios.post("/users/login", {
        userEmail: email,
        password: password,
      });
      alert(result.data.status);
      window.location.href = `/home?id=${result.data.user._id}`;
    } catch (err) {
      alert(err.response.data.message);
    }
  });
}
