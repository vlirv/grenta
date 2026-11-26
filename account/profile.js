/* =========================================================
   profile.js — profile page (Mouen)
   Needs login. Shows the user's data, saves changes,
   changes the password and logs out.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin();
  if (!user) return;

  const infoForm = document.getElementById("infoForm");
  const passForm = document.getElementById("passForm");

  // Fill the page with the user's data
  function showUser(u) {
    document.getElementById("pAvatar").textContent = u.name.charAt(0).toUpperCase();
    document.getElementById("pName").textContent = u.name;
    document.getElementById("pRole").textContent =
      u.role.charAt(0).toUpperCase() + u.role.slice(1) + " · " + (u.city || "");
  }
  showUser(user);
  document.getElementById("fullName").value = user.name;
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("email").value = user.email;

  // Number of bookings of this user
  const myBookings = Malaab.load("bookings").filter((b) => b.userId === user.id);
  const counts = document.querySelectorAll(".panel .row.text-center strong");
  if (counts[0]) counts[0].textContent = myBookings.length;

  function updateUser(changes) {
    const users = Malaab.load("users");
    const i = users.findIndex((u) => u.id === user.id);
    Object.assign(users[i], changes);
    Malaab.save("users", users);
    Object.assign(user, changes);
  }

  // Save personal info
  infoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(infoForm)) return;

    const email = document.getElementById("email").value.trim().toLowerCase();
    const taken = Malaab.load("users").some((u) => u.id !== user.id && u.email.toLowerCase() === email);
    if (taken) {
      Malaab.showAlert("#infoAlert", "This email is used by another account.", "warning");
      return;
    }

    updateUser({
      name: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: email
    });
    showUser(user);
    Malaab.refreshNavbar();
    Malaab.showAlert("#infoAlert", "Your information was saved.", "success");
  });

  // Change password
  passForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(passForm)) return;

    const oldPass = document.getElementById("oldPass").value;
    const newPass = document.getElementById("newPass").value;
    const newPass2 = document.getElementById("newPass2").value;

    if (oldPass !== user.password) {
      Malaab.showAlert("#passAlert", "Current password is wrong.", "danger");
      return;
    }
    if (newPass !== newPass2) {
      Malaab.showAlert("#passAlert", "New passwords do not match.", "danger");
      return;
    }
    updateUser({ password: newPass });
    passForm.reset();
    passForm.classList.remove("was-validated");
    Malaab.showAlert("#passAlert", "Password updated.", "success");
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Do you want to log out?")) {
      Malaab.logout();
      Malaab.go("account/login.html");
    }
  });
});
