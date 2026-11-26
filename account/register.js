/* =========================================================
   register.js — player sign-up (Mouen)
   Validates the form, checks the passwords match and the
   email is not used, then saves the new player.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const pass = form.elements.password;
  const pass2 = form.elements.password2;

  // Live check: confirm password must match
  function checkMatch() {
    pass2.setCustomValidity(pass2.value && pass2.value !== pass.value ? "Passwords do not match" : "");
  }
  pass.addEventListener("input", checkMatch);
  pass2.addEventListener("input", checkMatch);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    checkMatch();
    if (!Malaab.validate(form)) {
      if (pass2.validationMessage) Malaab.showAlert("#formAlert", pass2.validationMessage, "danger");
      return;
    }

    const users = Malaab.load("users");
    const email = form.elements.email.value.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === email)) {
      Malaab.showAlert("#formAlert", "This email is already registered. Try logging in.", "warning");
      return;
    }

    users.push({
      id: Malaab.nextId(users),
      name: form.elements.name.value.trim(),
      email: email,
      phone: form.elements.phone.value.trim(),
      city: form.elements.city.value,
      password: pass.value,
      role: "player",
      status: "active"
    });
    Malaab.save("users", users);

    Malaab.go("account/login.html?registered=1&email=" + encodeURIComponent(email));
  });
});
