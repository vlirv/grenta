/* =========================================================
   forgot-password.js — reset a password (Mouen)
   Demo version (no email): the user proves the account with
   email + phone, then chooses a new password.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const checkForm = document.getElementById("checkForm");
  const resetForm = document.getElementById("resetForm");
  const stepText = document.getElementById("stepText");
  let userId = null;

  // Step 1: find the account
  checkForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(checkForm)) return;

    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const user = Malaab.load("users").find(function (u) {
      return u.email.toLowerCase() === email && u.phone === phone;
    });

    if (!user) {
      Malaab.showAlert("#formAlert", "No account has this email and phone number.", "danger");
      return;
    }
    userId = user.id;
    document.getElementById("formAlert").innerHTML = "";
    checkForm.classList.add("d-none");
    resetForm.classList.remove("d-none");
    stepText.textContent = "Hello " + user.name + ", choose a new password.";
    document.getElementById("newPass").focus();
  });

  // Step 2: save the new password
  resetForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(resetForm)) return;

    const pass = document.getElementById("newPass").value;
    if (pass !== document.getElementById("newPass2").value) {
      Malaab.showAlert("#formAlert", "The passwords do not match.", "danger");
      return;
    }
    const users = Malaab.load("users");
    const user = users.find(function (u) { return u.id === userId; });
    user.password = pass;
    Malaab.save("users", users);
    Malaab.go("account/login.html?reset=1&email=" + encodeURIComponent(user.email));
  });
});
