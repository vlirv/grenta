/* =========================================================
   admin-users.js — users & owners page (Suhayib)

   TODO – build here:
   [ ] Malaab.requireLogin(["admin"])
   [ ] Tabs users / owners / fields with a search box
   [ ] Suspend / Reactivate: change status and save (login.js blocks suspended users)
   [ ] Add owner form: add a user with role "owner" and status "active"
   [ ] Reviews moderation: hide a review (hidden: true)

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
  console.log("users:", Malaab.load("users"));
});
