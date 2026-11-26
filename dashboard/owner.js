/* ========================================================= owner.js — owner dashboard (Suhayib) Stats and today's
bookings for the owner's fields. ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const owner = Malaab.requireLogin(["owner"]); if (!owner)
    return; const esc = Malaab.escapeHtml; const myFields = Malaab.load("fields").filter(function (f) {
      return f.ownerId ===
        owner.id;
    }); const myFieldIds = myFields.map(function (f) { return f.id; }); const bookings =
      Malaab.load("bookings").filter(function (b) { return myFieldIds.includes(b.fieldId); }); const users =
        Malaab.load("users"); function dateString(d) {
          return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
            + "-" + String(d.getDate()).padStart(2, "0");
        } const today = dateString(new Date()); const weekAgo = dateString(new
          Date(Date.now() - 6 * 86400000)); document.getElementById("greeting").textContent = "Welcome back, " + owner.name + "!";
  const todays = bookings.filter(function (b) {
    return b.date === today && (b.status === "confirmed" || b.status ===
      "pending");
  }).sort(function (a, b) { return a.time.localeCompare(b.time); }); const income = bookings.filter(function
    (b) {
    return (b.status === "confirmed" || b.status === "completed") && b.date >= weekAgo && b.date <= today;
  }).reduce(function (sum, b) { return sum + (b.paid || 0); }, 0); const rated = myFields.filter(function (f) {
    return
    f.rating;
  }); const avg = rated.length ? rated.reduce(function (s, f) { return s + f.rating; }, 0) / rated.length : 0;
  document.getElementById("statToday").textContent = todays.length;
  document.getElementById("statIncome").textContent = Malaab.formatPrice(income);
  document.getElementById("statPending").textContent = bookings.filter(function (b) {
    return b.status === "pending";
  }).length; document.getElementById("statRating").textContent = avg ? avg.toFixed(1) : "–"; const METHOD = {
    deposit: "Deposit", full: "Full", field: "At field"
  };
  document.getElementById("todayRows").innerHTML = todays.map(function (b) {
    const field = myFields.find(function (f) {
      return f.id === b.fieldId;
    }); const player = users.find(function (u) { return u.id === b.userId; }); const
      css = b.status === "confirmed" ? "status-confirmed" : "status-pending"; return "<tr><td>" + esc(b.time) + "</td><td>" +
        esc(field.name) + "</td>" + "<td>" + esc(player ? player.name : "-") + "</td>" + "<td>" + (METHOD[b.payment] || "-")
        + "</td>" + '<td><span class="status ' + css + '">' + esc(b.status) + "</span></td></tr>";
  }).join("")
    || '<tr><td colspan="5" class="text-muted-site">No bookings today.</td></tr>';
});