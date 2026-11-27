/* =========================================================
   my-bookings.js — the player's bookings (Musab)
   Tabs upcoming / past / cancelled, cancel (until 24h before),
   receipt, message the owner, rate after the match.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin(["player"]);
  if (!user) return;

  const list = document.getElementById("bookingList");
  const esc = Malaab.escapeHtml;
  let tab = "upcoming";

  const STATUS = {
    pending: ["status-pending", "Pending"], confirmed: ["status-confirmed", "Confirmed"],
    completed: ["status-confirmed", "Completed"], rejected: ["status-cancelled", "Rejected"],
    cancelled: ["status-cancelled", "Cancelled"]
  };

  function startOf(b) {
    return new Date(b.date + "T" + b.time);
  }

  function groupOf(b) {
    if (b.status === "cancelled" || b.status === "rejected") return "cancelled";
    if (b.status === "completed" || startOf(b) < new Date()) return "past";
    return "upcoming";
  }

  function canCancel(b) {
    const hoursLeft = (startOf(b) - new Date()) / 3600000;
    return groupOf(b) === "upcoming" && hoursLeft > 24;
  }

  function myBookings() {
    return Malaab.load("bookings").filter(function (b) { return b.userId === user.id; });
  }

  function cardHtml(b, field) {
    const s = STATUS[b.status] || STATUS.pending;
    const group = groupOf(b);
    const played = group === "past" && (b.status === "confirmed" || b.status === "completed");
    let buttons = '<a class="btn btn-outline-main btn-sm" href="receipt.html?id=' + b.id + '">' +
      '<i class="bi bi-receipt"></i> Receipt</a>';
    if (group !== "cancelled") {
      buttons += ' <a class="btn btn-outline-main btn-sm" href="messages.html?booking=' + b.id + '">' +
        '<i class="bi bi-chat-dots"></i> Message owner</a>';
    }
    if (canCancel(b)) {
      buttons += ' <button type="button" class="btn btn-outline-danger btn-sm" data-cancel="' + b.id + '">' +
        '<i class="bi bi-x-circle"></i> Cancel</button>';
    }
    if (played) {
      buttons += ' <a class="btn btn-main btn-sm" href="../fields/reviews.html?field=' + b.fieldId + '">' +
        '<i class="bi bi-star"></i> Rate</a>';
    }

    return '<div class="col-md-6">' +
      '<div class="panel booking-card h-100 is-' + esc(b.status) + '">' +
        '<div class="d-flex justify-content-between align-items-start gap-2 mb-2">' +
          '<h2 class="h5 mb-0">' + esc(field ? field.name : "Field") + "</h2>" +
          '<span class="status ' + s[0] + '">' + s[1] + "</span></div>" +
        '<p class="mb-1"><i class="bi bi-calendar3"></i> ' + esc(b.date) +
          ' &nbsp; <i class="bi bi-clock"></i> ' + esc(b.time) + " · " + (b.hours || 1) + "h</p>" +
        '<p class="mb-2"><span class="price-tag">' + Malaab.formatPrice(b.total) + "</span>" +
          ' <small class="text-muted-site">paid ' + Malaab.formatPrice(b.paid || 0) + "</small></p>" +
        (b.status === "rejected" && b.reason
          ? '<p class="small text-danger mb-2">Reason: ' + esc(b.reason) + "</p>" : "") +
        (group === "upcoming" && !canCancel(b)
          ? '<p class="small text-muted-site mb-2">Less than 24 hours left: cancelling is closed.</p>' : "") +
        '<div class="d-flex flex-wrap gap-2">' + buttons + "</div>" +
      "</div></div>";
  }

  function render() {
    const fields = Malaab.load("fields");
    const all = myBookings();
    const counts = { upcoming: 0, past: 0, cancelled: 0 };
    all.forEach(function (b) { counts[groupOf(b)]++; });
    document.getElementById("countUpcoming").textContent = counts.upcoming;
    document.getElementById("countPast").textContent = counts.past;
    document.getElementById("countCancelled").textContent = counts.cancelled;

    const shown = all.filter(function (b) { return groupOf(b) === tab; })
      .sort(function (a, b) {
        return tab === "upcoming" ? startOf(a) - startOf(b) : startOf(b) - startOf(a);
      });

    if (shown.length === 0) {
      list.innerHTML = '<div class="col-12"><div class="panel text-center text-muted-site">' +
        "No bookings here.</div></div>";
      return;
    }
    list.innerHTML = shown.map(function (b) {
      return cardHtml(b, fields.find(function (f) { return f.id === b.fieldId; }));
    }).join("");
  }

  // Tabs
  document.getElementById("tabs").addEventListener("click", function (e) {
    const link = e.target.closest("[data-tab]");
    if (!link) return;
    e.preventDefault();
    this.querySelectorAll(".nav-link").forEach(function (a) { a.classList.remove("active"); });
    link.classList.add("active");
    tab = link.dataset.tab;
    render();
  });

  // Cancel
  list.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-cancel]");
    if (!btn) return;
    if (!confirm("Do you really want to cancel this booking?")) return;

    const bookings = Malaab.load("bookings");
    const b = bookings.find(function (x) { return x.id === Number(btn.dataset.cancel); });
    b.status = "cancelled";
    Malaab.save("bookings", bookings);

    const field = Malaab.load("fields").find(function (f) { return f.id === b.fieldId; });
    const notes = Malaab.load("notifications");
    notes.unshift({
      id: Malaab.nextId(notes), userId: field ? field.ownerId : null, type: "booking", icon: "bi-x-circle",
      title: "Booking cancelled", text: user.name + " cancelled the booking on " + b.date + " at " + b.time + ".",
      time: "Just now", read: false
    });
    Malaab.save("notifications", notes);

    render();
    Malaab.showAlert("#formAlert", "Your booking was cancelled.", "success");
  });

  render();
});
