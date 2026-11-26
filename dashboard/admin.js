/* =========================================================
   admin.js — admin dashboard (Suhayib)

   TODO – build here:
   [ ] Protect the page: Malaab.requireLogin(["admin"])
   [ ] Stat cards: number of users, owners, fields, bookings today
   [ ] Bookings-by-day chart: simple bars (div height = count) for the last 7 days

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;
  console.log("users:", Malaab.load("users").length, "fields:", Malaab.load("fields").length);
});
