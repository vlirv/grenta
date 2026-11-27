/* =========================================================
   login.js — login page (Mouen)
   Checks email + password + role against the users list,
   saves the session and sends the user to the right page:
   player → home, owner → owner panel.
   Admin accounts cannot log in here (they have a private page).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const params = new URLSearchParams(location.search);

  // Message coming from the register pages
  if (params.get("registered") === "1") {
    Malaab.showAlert("#formAlert", "Account created. You can log in now.", "success");
  }
  if (params.get("reset") === "1") {
    Malaab.showAlert("#formAlert", "Your password was changed. Log in with the new password.", "success");
  }
  if (params.get("email")) {
    form.elements.email.value = params.get("email");
  }

  // Already logged in? Go straight to the right page
  const current = Malaab.currentUser();
  if (current) {
    Malaab.showAlert("#formAlert", "You are logged in as " + current.name + ". Log in again to switch account.", "info");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;

    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const role = form.elements.role.value;

    const user = Malaab.load("users").find((u) => u.email.toLowerCase() === email);

    // Admins use their own private login page, not this one
    if (!user || user.password !== password || user.role === "admin") {
      Malaab.showAlert("#formAlert", "Wrong email or password.", "danger");
      return;
    }
    if (user.role !== role) {
      Malaab.showAlert("#formAlert", "This account is a " + user.role + " account. Choose \"" + user.role + "\" above.", "warning");
      return;
    }
    if (user.status === "pending") {
      Malaab.showAlert("#formAlert", "Your owner account is still waiting for admin approval.", "warning");
      return;
    }
    if (user.status === "suspended") {
      Malaab.showAlert("#formAlert", "This account is suspended. Please contact support.", "danger");
      return;
    }

    Malaab.login(user);
    Malaab.showAlert("#formAlert", "Welcome, " + user.name + "!", "success");

    // Go back to the page that asked for login (same site only), else the role's home page
    const next = params.get("next");
    setTimeout(function () {
      if (next && next.indexOf(location.origin) === 0) {
        location.href = next;
      } else {
        Malaab.go(Malaab.homeFor(user.role));
      }
    }, 600);
  });
});
