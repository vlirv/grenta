/* =========================================================
   staff-x7q2.js — private admin login (Mouen)
   This page is not linked anywhere. The admin needs the
   email, the password AND the access code.
   Only a fingerprint (SHA-256) of the access code is stored here.
   After 5 wrong tries the form is locked for 5 minutes.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const CODE_HASH = "d9764f6d89a3ce6a5359f3cc251248438a21fbbb244664c5b9dcf2b0e1292a02";
  const form = document.getElementById("adminForm");
  const LOCK_KEY = "malaab_adminLock";

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function lockInfo() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || { tries: 0, until: 0 }; }
    catch (e) { return { tries: 0, until: 0 }; }
  }
  function saveLock(info) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(info)); } catch (e) { /* ignore */ }
  }

  // Already logged in as admin: go straight to the panel
  const current = Malaab.currentUser();
  if (current && current.role === "admin") {
    Malaab.go("dashboard/admin.html");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;

    const lock = lockInfo();
    if (lock.until > Date.now()) {
      const min = Math.ceil((lock.until - Date.now()) / 60000);
      Malaab.showAlert("#formAlert", "Too many wrong tries. Try again in " + min + " minute(s).", "danger");
      return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const codeOk = (await sha256(document.getElementById("code").value.trim())) === CODE_HASH;
    const user = Malaab.load("users").find(function (u) { return u.email.toLowerCase() === email; });

    if (!codeOk || !user || user.role !== "admin" || user.password !== password) {
      lock.tries += 1;
      if (lock.tries >= 5) {
        lock.tries = 0;
        lock.until = Date.now() + 5 * 60 * 1000;
      }
      saveLock(lock);
      Malaab.showAlert("#formAlert", "Access denied.", "danger");
      return;
    }

    saveLock({ tries: 0, until: 0 });
    Malaab.login(user);
    Malaab.go("dashboard/admin.html");
  });
});
