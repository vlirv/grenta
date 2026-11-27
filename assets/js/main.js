/* =========================================================
   main.js — SHARED helpers used by every page (Mouen)
   Loaded on every page after data.js.

   Use them in your own page JS, for example:
     const fields = Malaab.load("fields");        // read (localStorage or demo data)
     Malaab.save("bookings", list);               // save
     const user = Malaab.currentUser();           // logged-in user or null
     Malaab.requireLogin(["owner"]);              // protect a page
     Malaab.showAlert("#formAlert", "Saved!", "success");
     Malaab.go("booking/receipt.html");           // go to a page (path from project root)
     Malaab.formatPrice(120)                      // "120 LYD"
   ========================================================= */

const Malaab = (function () {
  const PREFIX = "malaab_";

  // Root folder of the site, found from this script's own address,
  // so links work from any folder (index.html, account/, booking/ …).
  const ROOT = document.currentScript.src.replace(/assets\/js\/main\.js.*$/, "");

  /* ---------- storage ---------- */
  function load(key) {
    try {
      const saved = localStorage.getItem(PREFIX + key);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* storage blocked: fall back to demo data */ }
    const demo = MALAAB_DATA[key];
    return demo === undefined ? null : JSON.parse(JSON.stringify(demo));
  }

  function save(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save", key, e);
    }
  }

  function nextId(list) {
    return list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  }

  /* ---------- navigation ---------- */
  function url(path) {
    return ROOT + path;
  }

  function go(path) {
    window.location.href = url(path);
  }

  /* ---------- session ---------- */
  function currentUser() {
    const id = load("session");
    if (!id) return null;
    return load("users").find((u) => u.id === id) || null;
  }

  function login(user) {
    save("session", user.id);
  }

  function logout() {
    try { localStorage.removeItem(PREFIX + "session"); } catch (e) { /* ignore */ }
  }

  // Home page for each role after login
  function homeFor(role) {
    if (role === "owner") return "dashboard/owner.html";
    if (role === "admin") return "dashboard/admin.html";
    return "index.html";
  }

  // Call at the top of a page that needs login.
  // roles: optional list, e.g. ["owner"] or ["admin"]
  function requireLogin(roles) {
    const user = currentUser();
    if (!user) {
      go("account/login.html?next=" + encodeURIComponent(location.href));
      return null;
    }
    if (roles && !roles.includes(user.role)) {
      alert("You don't have access to this page.");
      go(homeFor(user.role));
      return null;
    }
    return user;
  }

  /* ---------- UI helpers ---------- */
  function showAlert(target, message, type) {
    const box = typeof target === "string" ? document.querySelector(target) : target;
    if (!box) return;
    box.innerHTML = "";
    const div = document.createElement("div");
    div.className = "alert alert-" + (type || "info") + " alert-dismissible fade show";
    div.setAttribute("role", "alert");
    div.textContent = message;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "btn-close";
    close.setAttribute("data-bs-dismiss", "alert");
    close.setAttribute("aria-label", "Close");
    div.appendChild(close);
    box.appendChild(div);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Bootstrap-style validation: returns true if the form is valid
  function validate(form) {
    form.classList.add("was-validated");
    return form.checkValidity();
  }

  function formatPrice(n) {
    return Number(n).toLocaleString("en-US") + " LYD";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function unreadCount() {
    return load("notifications").filter((n) => !n.read).length;
  }

  // Updates the navbar: bell count + logged-in user icon
  function refreshNavbar() {
    const badge = document.getElementById("navBadge");
    if (badge) {
      const n = unreadCount();
      badge.textContent = n;
      badge.style.display = n > 0 ? "" : "none";
    }

    const userLink = document.getElementById("navUser");
    const user = currentUser();
    if (userLink && user) {
      userLink.href = url(user.role === "player" ? "account/profile.html" : homeFor(user.role));
      userLink.title = user.name + " (" + user.role + ")";
      userLink.innerHTML = '<i class="bi bi-person-check-fill"></i>';
    }
  }

  /* ---------- interactive effects (every page) ---------- */

  // Cards and panels slide up when they come into view
  function setupReveal() {
    if (!("IntersectionObserver" in window)) return;
    const items = document.querySelectorAll(
      "main .panel, main .field-card, main .step-card, main .stats-band, main .todo-box"
    );
    if (items.length === 0) return;

    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(function (el) {
      // Skip panels that contain fixed things like modals, and nested panels
      if (el.querySelector(".modal") || el.parentElement.closest(".reveal")) return;
      el.classList.add("reveal");
      observer.observe(el);
    });

    // New cards drawn later by page scripts show at once
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        const box = el.getBoundingClientRect();
        if (box.top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 800);
  }

  // Football button that scrolls back to the top
  function setupBallTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ball-top";
    btn.title = "Back to top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "<span>⚽</span>";
    document.body.appendChild(btn);

    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    refreshNavbar();
    setupReveal();
    setupBallTop();
  });

  return {
    load, save, nextId, url, go,
    currentUser, login, logout, homeFor, requireLogin,
    showAlert, validate, formatPrice, escapeHtml, unreadCount, refreshNavbar
  };
})();
