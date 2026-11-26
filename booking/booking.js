/* =========================================================
   booking.js — booking page (Musab)

   TODO – build here:
   [ ] Get the field from the URL: booking.html?field=1
   [ ] Make the next 7 days as buttons; clicking one shows that day's slots
   [ ] Make time slots (e.g. 16:00 → 23:00); a slot is booked if Malaab.load("bookings") has the same field/date/time
   [ ] Click a free slot = select it (green border); booked slots are disabled
   [ ] Options: recurring weekly, extra hour → update the price
   [ ] "Continue": save the choice (Malaab.save("cart", {...})) and Malaab.go("booking/checkout.html")
   [ ] Must be logged in: Malaab.requireLogin(["player"])

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const fieldId = Number(new URLSearchParams(location.search).get("field")) || 1;
  const field = Malaab.load("fields").find((f) => f.id === fieldId);
  console.log("booking field:", field);
});
