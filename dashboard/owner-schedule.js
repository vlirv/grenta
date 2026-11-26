/* =========================================================
   owner-schedule.js — schedule page (Suhayib)

   TODO – build here:
   [ ] Malaab.requireLogin(["owner"])
   [ ] Save opening hours per day: Malaab.save("schedule", {...})
   [ ] Add / remove blocked dates
   [ ] Weekly calendar: put each booking in the right day column

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const owner = Malaab.requireLogin(["owner"]);
  if (!owner) return;
  console.log("schedule:", Malaab.load("schedule"));
});
