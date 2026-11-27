/* =========================================================
   admin-bookings.js — every booking on the platform, with
   filters, totals, CSV download and cancel (Suhayib)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;

  const myFields = Malaab.load("fields"); // the admin sees all fields

  const esc = Malaab.escapeHtml;
  const users = Malaab.load("users");
  const STATUS = {
    pending: ["status-pending", "Pending"], confirmed: ["status-confirmed", "Confirmed"],
    completed: ["status-confirmed", "Completed"], rejected: ["status-cancelled", "Rejected"],
    cancelled: ["status-cancelled", "Cancelled"]
  };
  const METHOD = { deposit: "Deposit 30%", full: "Full", field: "At field" };
  const f = {
    search: document.getElementById("fSearch"), field: document.getElementById("fField"),
    status: document.getElementById("fStatus"), from: document.getElementById("fFrom"),
    to: document.getElementById("fTo")
  };

  // A confirmed booking whose time has passed counts as completed
  function statusOf(b) {
    if (b.status === "confirmed" && new Date(b.date + "T" + b.time) < new Date()) return "completed";
    return b.status;
  }
  function nameOf(id) {
    const u = users.find(function (x) { return x.id === id; });
    return u ? u.name : "-";
  }

  f.field.innerHTML += myFields.map(function (x) {
    return '<option value="' + x.id + '">' + esc(x.name) + "</option>";
  }).join("");

  function filtered() {
    const ids = myFields.map(function (x) { return x.id; });
    const text = f.search.value.trim().toLowerCase();
    return Malaab.load("bookings").filter(function (b) {
      if (!ids.includes(b.fieldId)) return false;
      const field = myFields.find(function (x) { return x.id === b.fieldId; });
      const words = ("#" + b.id + " " + nameOf(b.userId) + " " + field.name).toLowerCase();
      return (!text || words.includes(text)) &&
        (!f.field.value || b.fieldId === Number(f.field.value)) &&
        (!f.status.value || statusOf(b) === f.status.value) &&
        (!f.from.value || b.date >= f.from.value) &&
        (!f.to.value || b.date <= f.to.value);
    }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); });
  }

  function totals(list) {
    const counted = list.filter(function (b) { return b.status !== "cancelled" && b.status !== "rejected"; });
    const sum = function (key) { return counted.reduce(function (s, b) { return s + (b[key] || 0); }, 0); };
    document.getElementById("sCount").textContent = list.length;
    document.getElementById("sTotal").textContent = Malaab.formatPrice(sum("total"));
    document.getElementById("sPaid").textContent = Malaab.formatPrice(sum("paid"));
    document.getElementById("sRemaining").textContent = Malaab.formatPrice(sum("total") - sum("paid"));
  }

  // Download the shown bookings as a CSV file (opens in Excel)
  function downloadCsv(list, extraCols) {
    const head = ["Booking", "Date", "Time", "Hours", "Field", "Player"].concat(extraCols.map(function (c) {
      return c.title;
    })).concat(["Payment", "Total", "Paid", "Status"]);
    const rows = list.map(function (b) {
      const field = myFields.find(function (x) { return x.id === b.fieldId; });
      return [b.id, b.date, b.time, b.hours || 1, field ? field.name : "", nameOf(b.userId)]
        .concat(extraCols.map(function (c) { return c.value(b); }))
        .concat([METHOD[b.payment] || "", b.total, b.paid || 0, statusOf(b)]);
    });
    const csv = [head].concat(rows).map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    link.download = "malaab-bookings.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  [f.search, f.field, f.status, f.from, f.to].forEach(function (el) { el.addEventListener("input", render); });
  document.getElementById("fReset").addEventListener("click", function () {
    [f.search, f.field, f.status, f.from, f.to].forEach(function (el) { el.value = ""; });
    render();
  });

  function ownerOf(b) {
    const field = myFields.find(function (x) { return x.id === b.fieldId; });
    return field ? nameOf(field.ownerId) : "-";
  }

  document.getElementById("bookHead").innerHTML =
    "<tr><th>#</th><th>Date</th><th>Time</th><th>Field</th><th>Owner</th><th>Player</th>" +
    "<th>Total</th><th>Paid</th><th>Status</th><th></th></tr>";

  function render() {
    const list = filtered();
    totals(list);
    document.getElementById("bookRows").innerHTML = list.map(function (b) {
      const field = myFields.find(function (x) { return x.id === b.fieldId; });
      const st = statusOf(b);
      const s = STATUS[st] || STATUS.pending;
      const canCancel = st === "pending" || st === "confirmed";
      return '<tr><td><a href="../booking/receipt.html?id=' + b.id + '">#' + b.id + "</a></td>" +
        "<td>" + esc(b.date) + "</td><td>" + esc(b.time) + "</td>" +
        "<td>" + esc(field ? field.name : "-") + "</td><td>" + esc(ownerOf(b)) + "</td>" +
        "<td>" + esc(nameOf(b.userId)) + "</td><td>" + Malaab.formatPrice(b.total) + "</td>" +
        "<td>" + Malaab.formatPrice(b.paid || 0) + "</td>" +
        '<td><span class="status ' + s[0] + '">' + s[1] + "</span></td>" +
        '<td class="text-end">' + (canCancel ? '<button type="button" class="btn btn-sm btn-outline-danger" ' +
          'data-cancel="' + b.id + '">Cancel</button>' : "") + "</td></tr>";
    }).join("") || '<tr><td colspan="10" class="text-muted-site">No bookings match these filters.</td></tr>';
  }

  // Admin cancels a booking: the player and the owner are notified
  document.getElementById("bookRows").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-cancel]");
    if (!btn || !confirm("Cancel booking #" + btn.dataset.cancel + "?")) return;
    const bookings = Malaab.load("bookings");
    const b = bookings.find(function (x) { return x.id === Number(btn.dataset.cancel); });
    b.status = "cancelled";
    b.reason = "Cancelled by the admin";
    Malaab.save("bookings", bookings);
    const field = myFields.find(function (x) { return x.id === b.fieldId; });
    const notes = Malaab.load("notifications");
    [b.userId, field ? field.ownerId : null].forEach(function (uid) {
      if (uid === null) return;
      notes.unshift({
        id: Malaab.nextId(notes), userId: uid, type: "booking", icon: "bi-x-circle",
        title: "Booking cancelled", text: "Booking #" + b.id + " on " + b.date + " was cancelled by the admin.",
        time: "Just now", read: false
      });
    });
    Malaab.save("notifications", notes);
    render();
  });

  document.getElementById("csvBtn").addEventListener("click", function () {
    downloadCsv(filtered(), [{ title: "Owner", value: ownerOf }]);
  });

  render();
});
