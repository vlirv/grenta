/* =========================================================
   owner-requests.js — accept / reject bookings and manage
   the owner's coupons (Suhayib)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const owner = Malaab.requireLogin(["owner"]);
  if (!owner) return;

  const esc = Malaab.escapeHtml;
  const rows = document.getElementById("requestRows");
  const rejectModal = new bootstrap.Modal(document.getElementById("rejectModal"));
  const rejectForm = document.getElementById("rejectForm");
  const couponForm = document.getElementById("couponForm");

  let tab = "pending";
  let rejectId = null;

  const myFields = Malaab.load("fields").filter(function (f) {
    return f.ownerId === owner.id;
  });
  const myFieldIds = myFields.map(function (f) {
    return f.id;
  });

  const STATUS = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    completed: "status-confirmed",
    rejected: "status-cancelled",
    cancelled: "status-cancelled"
  };

  function fieldName(id) {
    const f = myFields.find(function (x) {
      return x.id === id;
    });
    return f ? f.name : "-";
  }

  function notify(userId, icon, title, text) {
    const notes = Malaab.load("notifications");
    notes.unshift({
      id: Malaab.nextId(notes),
      userId: userId,
      type: "booking",
      icon: icon,
      title: title,
      text: text,
      time: "Just now",
      read: false
    });
    Malaab.save("notifications", notes);
  }

  // ===== Requests =====
  function renderRequests() {
    const users = Malaab.load("users");
    const mine = Malaab.load("bookings").filter(function (b) {
      return myFieldIds.includes(b.fieldId);
    });

    document.getElementById("countPending").textContent = mine.filter(function (b) {
      return b.status === "pending";
    }).length;

    const shown = mine
      .filter(function (b) {
        if (tab === "pending") return b.status === "pending";
        if (tab === "confirmed") return b.status === "confirmed" || b.status === "completed";
        return b.status === "rejected" || b.status === "cancelled";
      })
      .sort(function (a, b) {
        return (a.date + a.time).localeCompare(b.date + b.time);
      });

    rows.innerHTML = shown.map(function (b) {
      const p = users.find(function (u) {
        return u.id === b.userId;
      });
      const actions = b.status === "pending"
        ? '<button type="button" class="btn btn-main btn-sm" data-accept="' + b.id + '">' +
            '<i class="bi bi-check-lg"></i> Accept' +
          "</button> " +
          '<button type="button" class="btn btn-outline-danger btn-sm" data-reject="' + b.id + '">' +
            '<i class="bi bi-x-lg"></i> Reject' +
          "</button>"
        : '<a class="btn btn-outline-main btn-sm" href="../booking/messages.html?booking=' + b.id + '">' +
            '<i class="bi bi-chat-dots"></i>' +
          "</a>";

      return (
        "<tr>" +
          "<td>" + esc(p ? p.name : "-") + (p && p.phone ? '<br><small class="text-muted-site">' + esc(p.phone) + "</small>" : "") + "</td>" +
          "<td>" + esc(fieldName(b.fieldId)) + "</td>" +
          "<td>" + esc(b.date) + "</td>" +
          "<td>" + esc(b.time) + " · " + (b.hours || 1) + "h</td>" +
          "<td>" + Malaab.formatPrice(b.total) + "</td>" +
          "<td>" + Malaab.formatPrice(b.paid || 0) + "</td>" +
          '<td><span class="status ' + (STATUS[b.status] || "") + '">' + esc(b.status) + "</span>" +
            (b.reason ? '<br><small class="text-muted-site">' + esc(b.reason) + "</small>" : "") +
          "</td>" +
          '<td class="text-end text-nowrap">' + actions + "</td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="8" class="text-muted-site">Nothing here.</td></tr>';
  }

  function updateBooking(id, change) {
    const bookings = Malaab.load("bookings");
    const b = bookings.find(function (x) {
      return x.id === id;
    });
    if (b) change(b);
    Malaab.save("bookings", bookings);
    return b;
  }

  rows.addEventListener("click", function (e) {
    const acceptBtn = e.target.closest("[data-accept]");
    const rejectBtn = e.target.closest("[data-reject]");

    if (acceptBtn) {
      const b = updateBooking(Number(acceptBtn.dataset.accept), function (x) {
        x.status = "confirmed";
      });
      if (b) {
        notify(
          b.userId,
          "bi-check-circle",
          "Booking confirmed",
          fieldName(b.fieldId) + " accepted your booking on " + b.date + " at " + b.time + "."
        );
      }
      renderRequests();
      Malaab.showAlert("#formAlert", "Booking accepted. The player was notified.", "success");
    }

    if (rejectBtn) {
      rejectId = Number(rejectBtn.dataset.reject);
      rejectForm.reset();
      rejectForm.classList.remove("was-validated");
      rejectModal.show();
    }
  });

  rejectForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(rejectForm)) return;

    const reason = document.getElementById("reason").value.trim();
    const b = updateBooking(rejectId, function (x) {
      x.status = "rejected";
      x.reason = reason;
    });

    if (b) {
      notify(
        b.userId,
        "bi-x-circle",
        "Booking rejected",
        fieldName(b.fieldId) + " rejected your booking on " + b.date + ". Reason: " + reason
      );
    }

    rejectModal.hide();
    renderRequests();
    Malaab.showAlert("#formAlert", "Booking rejected. The player was notified.", "info");
  });

  document.getElementById("tabs").addEventListener("click", function (e) {
    const link = e.target.closest("[data-tab]");
    if (!link) return;
    e.preventDefault();
    this.querySelectorAll(".nav-link").forEach(function (a) {
      a.classList.remove("active");
    });
    link.classList.add("active");
    tab = link.dataset.tab;
    renderRequests();
  });

  // ===== Coupons =====
  document.getElementById("couponField").innerHTML = myFields.map(function (f) {
    return '<option value="' + f.id + '">' + esc(f.name) + "</option>";
  }).join("");

  document.getElementById("expires").min = new Date().toISOString().slice(0, 10);

  function renderCoupons() {
    const mine = Malaab.load("coupons").filter(function (c) {
      return myFieldIds.includes(c.fieldId);
    });

    document.getElementById("couponRows").innerHTML = mine.map(function (c) {
      return (
        "<tr>" +
          "<td><strong>" + esc(c.code) + "</strong></td>" +
          "<td>" + (c.type === "percent" ? c.value + "%" : Malaab.formatPrice(c.value)) + "</td>" +
          "<td>" + esc(fieldName(c.fieldId)) + "</td>" +
          "<td>" + esc(c.expires) + "</td>" +
          "<td>" + (c.used || 0) + (c.maxUses ? " / " + c.maxUses : "") + "</td>" +
          '<td><button type="button" class="btn btn-sm btn-outline-danger" data-code="' + esc(c.code) + '">' +
            '<i class="bi bi-trash"></i>' +
          "</button></td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="6" class="text-muted-site">No coupons yet.</td></tr>';
  }

  document.getElementById("couponRows").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-code]");
    if (!btn || !confirm("Delete coupon " + btn.dataset.code + "?")) return;
    Malaab.save("coupons", Malaab.load("coupons").filter(function (c) {
      return c.code !== btn.dataset.code;
    }));
    renderCoupons();
  });

  couponForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(couponForm)) return;

    const coupons = Malaab.load("coupons");
    const code = document.getElementById("code").value.trim().toUpperCase();
    if (coupons.some(function (c) { return c.code === code; })) {
      Malaab.showAlert("#couponAlert", "This code already exists.", "warning");
      return;
    }

    coupons.push({
      code: code,
      type: document.getElementById("type").value,
      value: Number(document.getElementById("value").value),
      fieldId: Number(document.getElementById("couponField").value),
      expires: document.getElementById("expires").value,
      maxUses: Number(document.getElementById("maxUses").value) || undefined,
      used: 0
    });

    Malaab.save("coupons", coupons);
    couponForm.reset();
    couponForm.classList.remove("was-validated");
    renderCoupons();
    Malaab.showAlert("#couponAlert", "Coupon " + code + " added.", "success");
  });

  renderRequests();
  renderCoupons();
});