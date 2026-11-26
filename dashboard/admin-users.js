/* =========================================================
   admin.js — admin dashboard (Suhayib)
   Platform stats, bookings-per-day bar chart (plain CSS),
   latest bookings.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;

  const esc = Malaab.escapeHtml;
  const users = Malaab.load("users");
  const fields = Malaab.load("fields");
  const bookings = Malaab.load("bookings");

  function dateString(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  const today = dateString(new Date());

  document.getElementById("statPlayers").textContent = users.filter(function (u) {
    return u.role === "player";
  }).length;

  document.getElementById("statOwners").textContent = users.filter(function (u) {
    return u.role === "owner" && u.status === "active";
  }).length;

  document.getElementById("statFields").textContent = fields.filter(function (f) {
    return !f.status || f.status === "active";
  }).length;

  document.getElementById("statToday").textContent = bookings.filter(function (b) {
    return b.date === today;
  }).length;

  document.getElementById("statApprovals").textContent =
    users.filter(function (u) { return u.role === "owner" && u.status === "pending"; }).length +
    fields.filter(function (f) { return f.status === "pending"; }).length;

  // ===== Chart: bookings made per day (the day the player booked) for the last 7 days =====
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const ds = dateString(d);

    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: bookings.filter(function (b) {
        return (b.createdAt ? b.createdAt.slice(0, 10) : b.date) === ds;
      }).length
    });
  }

  const max = Math.max(1, Math.max.apply(null, days.map(function (d) { return d.count; })));
  const bars = document.getElementById("chartBars");

  bars.innerHTML = days.map(function (d) {
    return (
      '<div class="bar-col">' +
        '<span class="bar-value">' + d.count + "</span>" +
        '<div class="bar" data-height="' + Math.round((d.count / max) * 100) + '"></div>' +
      "</div>"
    );
  }).join("");

  document.getElementById("chartLabels").innerHTML = days.map(function (d) {
    return "<span>" + d.label + "</span>";
  }).join("");

  // Grow the bars (heights set from JS, not inline HTML)
  requestAnimationFrame(function () {
    bars.querySelectorAll(".bar").forEach(function (bar) {
      bar.style.height = bar.dataset.height + "%";
    });
  });

  // ===== Latest bookings =====
  const STATUS = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    completed: "status-confirmed",
    rejected: "status-cancelled",
    cancelled: "status-cancelled"
  };

  document.getElementById("latestRows").innerHTML = bookings
    .slice()
    .sort(function (a, b) { return b.id - a.id; })
    .slice(0, 5)
    .map(function (b) {
      const f = fields.find(function (x) { return x.id === b.fieldId; });
      return (
        "<tr>" +
          '<td><a href="../booking/receipt.html?id=' + b.id + '">#' + b.id + "</a></td>" +
          "<td>" + esc(f ? f.name : "-") + "</td>" +
          "<td>" + esc(b.date) + "</td>" +
          '<td><span class="status ' + (STATUS[b.status] || "") + '">' + esc(b.status) + "</span></td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="4" class="text-muted-site">No bookings yet.</td></tr>';
});