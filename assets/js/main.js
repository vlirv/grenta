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
     Malaab.myNotifications()                     // notifications of the logged-in user
     Malaab.isFavorite(fieldId) / Malaab.favButton(fieldId)   // favourites (heart button)
     Malaab.lang()                                // "en" or "ar"
   ========================================================= */

const Malaab = (function () {
  const PREFIX = "malaab_";

  // Root folder of the site, found from this script's own address,
  // so links work from any folder (index.html, account/, booking/ …).
  const ROOT = document.currentScript.src.replace(/assets\/js\/main\.js.*$/, "");

  // When data.js gets a new version, old saved demo data is cleared once,
  // so every visitor gets the new fields, photos, etc.
  (function checkDataVersion() {
    try {
      const saved = localStorage.getItem(PREFIX + "version");
      if (saved !== String(MALAAB_DATA.version)) {
        const lang = localStorage.getItem(PREFIX + "lang");
        Object.keys(localStorage).forEach(function (k) {
          if (k.indexOf(PREFIX) === 0) localStorage.removeItem(k);
        });
        localStorage.setItem(PREFIX + "version", String(MALAAB_DATA.version));
        if (lang) localStorage.setItem(PREFIX + "lang", lang);
      }
    } catch (e) { /* storage blocked */ }
  })();

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

  // Is this notification for this user?
  // With userId: only that user. Without userId (general, e.g. offers): players only.
  function isForUser(n, user) {
    if (!user) return false;
    if (n.userId !== undefined && n.userId !== null) return n.userId === user.id;
    return user.role === "player";
  }

  // Notifications of the logged-in user (empty list when logged out)
  function myNotifications() {
    const user = currentUser();
    return load("notifications").filter((n) => isForUser(n, user));
  }

  function unreadCount() {
    return myNotifications().filter((n) => !n.read).length;
  }

  /* ---------- free time slots (used by search) ---------- */
  // Free start times of a field on a date ("YYYY-MM-DD"), using the owner's
  // schedule (default 16:00–23:00, 1-hour slots) and existing bookings.
  function freeSlots(fieldId, dateStr) {
    const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const sched = (load("schedule") || {})[fieldId] || {};
    if ((sched.blocked || []).includes(dateStr)) return [];
    const day = sched.days && sched.days[DAY_KEYS[new Date(dateStr + "T00:00").getDay()]];
    if (day && day.closed) return [];
    const toMin = function (t) { return Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)); };
    const open = toMin(day ? day.open : "16:00");
    const close = toMin(day ? day.close : "23:00");
    const step = sched.slotMinutes || 60;
    const taken = load("bookings").filter(function (b) {
      return b.fieldId === fieldId && b.date === dateStr && (b.status === "pending" || b.status === "confirmed");
    });
    const now = new Date();
    const result = [];
    for (let m = open; m + step <= close; m += step) {
      const time = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
      if (new Date(dateStr + "T" + time) <= now) continue;
      const busy = taken.some(function (b) {
        const s = toMin(b.time);
        return m < s + (b.hours || 1) * 60 && s < m + step;
      });
      if (!busy) result.push(time);
    }
    return result;
  }

  /* ---------- favourites ---------- */
  // Saved as { "<userId>": [fieldId, …] }
  function favoriteIds() {
    const user = currentUser();
    if (!user) return [];
    return (load("favorites") || {})[user.id] || [];
  }

  function isFavorite(fieldId) {
    return favoriteIds().includes(Number(fieldId));
  }

  // Returns true if the field is now a favourite
  function toggleFavorite(fieldId) {
    const user = currentUser();
    if (!user) {
      go("account/login.html?next=" + encodeURIComponent(location.href));
      return false;
    }
    const all = load("favorites") || {};
    const list = all[user.id] || [];
    const id = Number(fieldId);
    all[user.id] = list.includes(id) ? list.filter((x) => x !== id) : list.concat(id);
    save("favorites", all);
    return all[user.id].includes(id);
  }

  // Heart button HTML for any field card: Malaab.favButton(field.id)
  function favButton(fieldId) {
    const on = isFavorite(fieldId);
    return '<button type="button" class="fav-btn' + (on ? " is-fav" : "") + '" data-fav="' + Number(fieldId) +
      '" aria-pressed="' + on + '" title="' + (on ? "Remove from favourites" : "Add to favourites") + '">' +
      '<i class="bi ' + (on ? "bi-heart-fill" : "bi-heart") + '"></i></button>';
  }

  // One click handler for every heart button on every page
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const on = toggleFavorite(btn.dataset.fav);
    if (!currentUser()) return;
    document.querySelectorAll('[data-fav="' + btn.dataset.fav + '"]').forEach(function (b) {
      b.classList.toggle("is-fav", on);
      b.setAttribute("aria-pressed", on);
      b.title = on ? "Remove from favourites" : "Add to favourites";
      b.querySelector("i").className = "bi " + (on ? "bi-heart-fill" : "bi-heart");
    });
    document.dispatchEvent(new CustomEvent("malaab:favorites"));
  });

  /* ---------- language ---------- */
  function lang() {
    try { return localStorage.getItem(PREFIX + "lang") === "ar" ? "ar" : "en"; } catch (e) { return "en"; }
  }

  function setLang(value) {
    try { localStorage.setItem(PREFIX + "lang", value); } catch (e) { /* ignore */ }
    location.reload();
  }

  // Arabic: switch Bootstrap to its RTL file and load the translations (lang-ar.js)
  function applyLanguage() {
    if (lang() !== "ar") return;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.querySelectorAll('link[href*="bootstrap.min.css"]').forEach(function (link) {
      link.href = link.href.replace("bootstrap.min.css", "bootstrap.rtl.min.css");
    });
    const script = document.createElement("script");
    script.src = url("assets/js/lang-ar.js");
    document.head.appendChild(script);
  }
  applyLanguage();

  /* ---------- navbar ---------- */
  const ROLE_NAME = { player: "Player", owner: "Field owner", admin: "Admin" };

  function navItem(href, icon, text) {
    return '<li><a class="dropdown-item" href="' + url(href) + '"><i class="bi ' + icon + '"></i> ' + text + "</a></li>";
  }

  // Updates the navbar: bell count, user menu, links for each role, language button
  function refreshNavbar() {
    const user = currentUser();

    const badge = document.getElementById("navBadge");
    if (badge) {
      const n = unreadCount();
      badge.textContent = n;
      badge.style.display = n > 0 ? "" : "none";
    }

    // Main links: owners/admins get their panel instead of "My Bookings"
    const links = document.querySelector("#mainNav .navbar-nav");
    if (links && !document.getElementById("navPanel")) {
      const myBookings = links.querySelector('a[href$="booking/my-bookings.html"]');
      if (user && user.role !== "player") {
        if (myBookings) myBookings.parentElement.classList.add("d-none");
        const li = document.createElement("li");
        li.className = "nav-item";
        li.id = "navPanel";
        const panelPage = homeFor(user.role);
        const here = location.pathname.indexOf("/dashboard/") !== -1;
        li.innerHTML = '<a class="nav-link' + (here ? " active" : "") + '" href="' + url(panelPage) + '">' +
          (user.role === "owner" ? "Owner panel" : "Admin panel") + "</a>";
        links.insertBefore(li, links.children[2] || null);
      }
    }

    // Language button (once)
    const icons = document.querySelector(".site-navbar .d-flex.order-lg-last");
    if (icons && !document.getElementById("langBtn")) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = "langBtn";
      b.className = "nav-icon lang-btn";
      b.title = lang() === "ar" ? "English" : "العربية";
      b.textContent = lang() === "ar" ? "EN" : "ع";
      b.addEventListener("click", function () { setLang(lang() === "ar" ? "en" : "ar"); });
      icons.insertBefore(b, icons.firstChild);
    }

    // User menu with logout
    const userLink = document.getElementById("navUser");
    if (userLink && user && !document.getElementById("userMenu")) {
      const items = [];
      if (user.role === "player") {
        items.push(navItem("account/profile.html", "bi-person", "My profile"));
        items.push(navItem("booking/my-bookings.html", "bi-calendar-check", "My bookings"));
        items.push(navItem("account/favorites.html", "bi-heart", "Favourites"));
        items.push(navItem("booking/messages.html", "bi-chat-dots", "Messages"));
      } else {
        items.push(navItem(homeFor(user.role), "bi-speedometer2",
          user.role === "owner" ? "Owner panel" : "Admin panel"));
        if (user.role === "owner") items.push(navItem("booking/messages.html", "bi-chat-dots", "Messages"));
        items.push(navItem("account/profile.html", "bi-person", "My profile"));
      }
      items.push(navItem("account/notifications.html", "bi-bell", "Notifications"));

      const menu = document.createElement("div");
      menu.className = "dropdown";
      menu.id = "userMenu";
      menu.innerHTML =
        '<button type="button" class="nav-icon user-btn dropdown-toggle" data-bs-toggle="dropdown" ' +
          'aria-expanded="false" title="' + escapeHtml(user.name) + '">' +
          '<i class="bi bi-person-check-fill"></i>' +
          '<span class="user-name d-none d-xl-inline">' + escapeHtml(user.name.split(" ")[0]) + "</span></button>" +
        '<ul class="dropdown-menu dropdown-menu-end shadow">' +
          '<li class="dropdown-header"><strong>' + escapeHtml(user.name) + "</strong><br>" +
            '<small>' + ROLE_NAME[user.role] + "</small></li>" +
          '<li><hr class="dropdown-divider"></li>' + items.join("") +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><a class="dropdown-item text-danger" href="#" id="logoutLink">' +
            '<i class="bi bi-box-arrow-right"></i> Logout</a></li>' +
        "</ul>";
      userLink.replaceWith(menu);
      document.getElementById("logoutLink").addEventListener("click", function (e) {
        e.preventDefault();
        logout();
        go("index.html");
      });
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

  // A missing photo shows the green placeholder instead of a broken image
  document.addEventListener("error", function (e) {
    const img = e.target;
    if (img.tagName !== "IMG" || img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = url("assets/images/placeholder.svg");
  }, true);

  // Small "Photo credits" link in every footer
  function addCreditsLink() {
    const line = document.querySelector(".site-footer .text-center.small");
    if (!line || line.querySelector(".credits-link")) return;
    const a = document.createElement("a");
    a.className = "credits-link";
    a.href = url("account/credits.html");
    a.textContent = "Photo credits";
    line.appendChild(document.createTextNode(" · "));
    line.appendChild(a);
  }

  document.addEventListener("DOMContentLoaded", function () {
    addCreditsLink();
    refreshNavbar();
    setupReveal();
    setupBallTop();
  });

  return {
    load, save, nextId, url, go,
    currentUser, login, logout, homeFor, requireLogin,
    showAlert, validate, formatPrice, escapeHtml, isForUser, myNotifications, unreadCount, refreshNavbar,
    isFavorite, toggleFavorite, favButton, favoriteIds, lang, setLang, freeSlots
  };
})();
