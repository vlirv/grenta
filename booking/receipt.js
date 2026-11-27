/* =========================================================
   receipt.js — printable receipt (Musab)
   Opens with receipt.html?id=BOOKING_ID
   The player, the field owner or the admin can see it.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin();
  if (!user) return;

  const id = Number(new URLSearchParams(location.search).get("id"));
  const booking = Malaab.load("bookings").find(function (b) { return b.id === id; });
  const field = booking && Malaab.load("fields").find(function (f) { return f.id === booking.fieldId; });
  const allowed = booking && (user.role === "admin" || booking.userId === user.id ||
    (field && field.ownerId === user.id));

  if (!allowed) {
    document.getElementById("receipt").innerHTML =
      '<p class="mb-3">Receipt not found.</p><a href="my-bookings.html" class="btn btn-main">My bookings</a>';
    return;
  }

  const player = Malaab.load("users").find(function (u) { return u.id === booking.userId; });
  const STATUS = {
    pending: ["status-pending", "Pending"], confirmed: ["status-confirmed", "Confirmed"],
    completed: ["status-confirmed", "Completed"], rejected: ["status-cancelled", "Rejected"],
    cancelled: ["status-cancelled", "Cancelled"]
  };
  const METHOD = { deposit: "deposit 30%", full: "full price", field: "pay at the field" };
  const discount = booking.discount || 0;
  const end = Number(booking.time.slice(0, 2)) + (booking.hours || 1);

  function set(id, text) {
    document.getElementById(id).textContent = text;
  }
  set("rNumber", "#" + booking.id);
  set("rIssued", "Issued " + (booking.createdAt || "").slice(0, 10));
  set("rPlayer", player ? player.name + " · " + (player.phone || "") : "");
  set("rField", field ? field.name + " – " + field.city : "");
  set("rWhen", booking.date + " · " + booking.time + " – " + String(end).padStart(2, "0") +
    booking.time.slice(2));
  set("rSubtotal", Malaab.formatPrice(booking.total + discount));
  set("rDiscount", "- " + Malaab.formatPrice(discount) + (booking.coupon ? " (" + booking.coupon + ")" : ""));
  set("rTotal", Malaab.formatPrice(booking.total));
  set("rMethod", METHOD[booking.payment] || "—");
  set("rPaid", Malaab.formatPrice(booking.paid || 0));
  set("rRemaining", Malaab.formatPrice(booking.total - (booking.paid || 0)));

  const s = STATUS[booking.status] || STATUS.pending;
  const badge = document.getElementById("rStatus");
  badge.className = "status " + s[0];
  badge.textContent = s[1];

  document.getElementById("printBtn").addEventListener("click", function () {
    window.print();
  });
});
