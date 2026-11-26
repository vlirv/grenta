/* =========================================================
   admin-users.js — manage players, owners, fields, reviews
   and platform coupons (Suhayib)
   Suspended users cannot log in (checked in login.js).
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;

  const esc = Malaab.escapeHtml;
  const head = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");
  const search = document.getElementById("search");

  let tab = "players";

  const BADGE = {
    active: "status-confirmed",
    pending: "status-pending",
    rejected: "status-cancelled",
    suspended: "status-cancelled"
  };

  function badge(status) {
    const s = status || "active";
    return '<span class="status ' + (BADGE[s] || "") + '">' + esc(s) + "</span>";
  }

  function toggleBtn(kind, id, status) {
    const suspended = status === "suspended";
    return (
      '<button type="button" class="btn btn-sm ' +
        (suspended ? "btn-main" : "btn-outline-danger") +
        '" data-kind="' + kind +
        '" data-id="' + id +
        '" data-action="' + (suspended ? "active" : "suspended") + '">' +
        (suspended ? "Reactivate" : "Suspend") +
      "</button>"
    );
  }

  function matches(text) {
    return (text || "").toLowerCase().includes(search.value.trim().toLowerCase());
  }

  function render() {
    const users = Malaab.load("users");
    const fields = Malaab.load("fields");
    let cols = [];
    let rows = [];

    if (tab === "players" || tab === "owners") {
      const role = tab === "players" ? "player" : "owner";
      cols = ["Name", "Email", "Phone", "City", "Status", ""];
      rows = users
        .filter(function (u) {
          return u.role === role && matches(u.name + " " + u.email + " " + u.phone);
        })
        .map(function (u) {
          return (
            "<tr>" +
              "<td>" + esc(u.name) + "</td>" +
              "<td>" + esc(u.email) + "</td>" +
              "<td>" + esc(u.phone) + "</td>" +
              "<td>" + esc(u.city) + "</td>" +
              "<td>" + badge(u.status) + "</td>" +
              '<td class="text-end">' +
                (u.status === "pending"
                  ? '<a href="admin-approvals.html">Review</a>'
                  : toggleBtn("user", u.id, u.status)) +
              "</td>" +
            "</tr>"
          );
        });
    }

    if (tab === "fields") {
      cols = ["Field", "City", "Owner", "Price", "Status", ""];
      rows = fields
        .filter(function (f) {
          return matches(f.name + " " + f.city + " " + f.area);
        })
        .map(function (f) {
          const o = users.find(function (u) { return u.id === f.ownerId; });
          return (
            "<tr>" +
              "<td>" + esc(f.name) + "</td>" +
              "<td>" + esc(f.city) + "</td>" +
              "<td>" + esc(o ? o.name : "-") + "</td>" +
              "<td>" + Malaab.formatPrice(f.price) + "</td>" +
              "<td>" + badge(f.status) + "</td>" +
              '<td class="text-end">' +
                (f.status === "pending"
                  ? '<a href="admin-approvals.html">Review</a>'
                  : toggleBtn("field", f.id, f.status)) +
              "</td>" +
            "</tr>"
          );
        });
    }

    if (tab === "reviews") {
      cols = ["Field", "Player", "Stars", "Comment", ""];
      rows = (Malaab.load("reviews") || [])
        .filter(function (r) {
          return matches(r.comment);
        })
        .map(function (r) {
          const f = fields.find(function (x) { return x.id === r.fieldId; });
          const u = users.find(function (x) { return x.id === r.userId; });
          return (
            "<tr" + (r.hidden ? ' class="opacity-50"' : "") + ">" +
              "<td>" + esc(f ? f.name : "-") + "</td>" +
              "<td>" + esc(u ? u.name : "-") + "</td>" +
              "<td>" + esc(String(r.stars)) + " ★</td>" +
              "<td>" + esc(r.comment) + "</td>" +
              '<td class="text-end">' +
                '<button type="button" class="btn btn-sm btn-outline-main" data-review="' + r.id + '">' +
                  (r.hidden ? "Show" : "Hide") +
                "</button>" +
              "</td>" +
            "</tr>"
          );
        });
    }

    if (tab === "coupons") {
      cols = ["Code", "Discount", "Field", "Expires", "Used", ""];
      rows = Malaab.load("coupons")
        .filter(function (c) {
          return matches(c.code);
        })
        .map(function (c) {
          const f = fields.find(function (x) { return x.id === c.fieldId; });
          return (
            "<tr>" +
              "<td><strong>" + esc(c.code) + "</strong></td>" +
              "<td>" + (c.type === "percent" ? esc(String(c.value)) + "%" : Malaab.formatPrice(c.value)) + "</td>" +
              "<td>" + esc(f ? f.name : "All fields") + "</td>" +
              "<td>" + esc(c.expires) + "</td>" +
              "<td>" + esc(String(c.used || 0)) + "</td>" +
              '<td class="text-end">' +
                '<button type="button" class="btn btn-sm btn-outline-danger" data-coupon="' + esc(c.code) + '">' +
                  '<i class="bi bi-trash"></i>' +
                "</button>" +
              "</td>" +
            "</tr>"
          );
        });
    }

    head.innerHTML = "<tr>" + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>";
    body.innerHTML = rows.join("") ||
      '<tr><td colspan="' + cols.length + '" class="text-muted-site">Nothing found.</td></tr>';
  }

  // Tabs and search
  document.getElementById("tabs").addEventListener("click", function (e) {
    const link = e.target.closest("[data-tab]");
    if (!link) return;
    e.preventDefault();
    this.querySelectorAll(".nav-link").forEach(function (a) { a.classList.remove("active"); });
    link.classList.add("active");
    tab = link.dataset.tab;
    search.value = "";
    render();
  });

  search.addEventListener("input", render);

  // Table buttons
  body.addEventListener("click", function (e) {
    const statusBtn = e.target.closest("[data-action]");
    const reviewBtn = e.target.closest("[data-review]");
    const couponBtn = e.target.closest("[data-coupon]");

    if (statusBtn) {
      const key = statusBtn.dataset.kind === "user" ? "users" : "fields";
      const list = Malaab.load(key);
      const item = list.find(function (x) { return x.id === Number(statusBtn.dataset.id); });
      if (!item || item.role === "admin") return; // never suspend an admin
      const action = statusBtn.dataset.action;
      if (!confirm((action === "suspended" ? "Suspend " : "Reactivate ") + item.name + "?")) return;
      item.status = action;
      Malaab.save(key, list);
      Malaab.showAlert(
        "#formAlert",
        item.name + (action === "suspended" ? " is suspended." : " is active again."),
        "success"
      );
    }

    if (reviewBtn) {
      const reviews = Malaab.load("reviews") || [];
      const r = reviews.find(function (x) { return x.id === Number(reviewBtn.dataset.review); });
      if (r) {
        r.hidden = !r.hidden;
        Malaab.save("reviews", reviews);
      }
    }

    if (couponBtn && confirm("Delete coupon " + couponBtn.dataset.coupon + "?")) {
      Malaab.save("coupons", Malaab.load("coupons").filter(function (c) {
        return c.code !== couponBtn.dataset.coupon;
      }));
    }

    render();
  });

  // Add owner
  const ownerForm = document.getElementById("ownerForm");
  ownerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(ownerForm)) return;

    const users = Malaab.load("users");
    const email = document.getElementById("oEmail").value.trim().toLowerCase();
    if (users.some(function (u) { return u.email.toLowerCase() === email; })) {
      Malaab.showAlert("#ownerAlert", "This email is already used.", "warning");
      return;
    }

    users.push({
      id: Malaab.nextId(users),
      name: document.getElementById("oName").value.trim(),
      email: email,
      phone: document.getElementById("oPhone").value.trim(),
      city: "",
      password: document.getElementById("oPassword").value,
      role: "owner",
      status: "active"
    });

    Malaab.save("users", users);
    ownerForm.reset();
    ownerForm.classList.remove("was-validated");
    Malaab.showAlert("#ownerAlert", "Owner added. They can log in now.", "success");
    render();
  });

  // Add platform coupon (for all fields)
  const couponForm = document.getElementById("couponForm");
  document.getElementById("cExpires").min = new Date().toISOString().slice(0, 10);

  couponForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(couponForm)) return;

    const coupons = Malaab.load("coupons");
    const code = document.getElementById("cCode").value.trim().toUpperCase();
    if (coupons.some(function (c) { return c.code === code; })) {
      Malaab.showAlert("#couponAlert", "This code already exists.", "warning");
      return;
    }

    coupons.push({
      code: code,
      type: document.getElementById("cType").value,
      value: Number(document.getElementById("cValue").value),
      expires: document.getElementById("cExpires").value,
      used: 0
    });

    Malaab.save("coupons", coupons);
    couponForm.reset();
    couponForm.classList.remove("was-validated");
    Malaab.showAlert("#couponAlert", "Coupon " + code + " added.", "success");
    render();
  });

  render();
});