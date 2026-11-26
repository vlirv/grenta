/* =========================================================
   owner.js — owner dashboard (Suhayib)

   TODO – build here:
   [ ] Protect the page: const owner = Malaab.requireLogin(["owner"]);
   [ ] Stat cards: today's bookings, this week's income, pending requests, average rating
   [ ] Today's bookings table from Malaab.load("bookings") for this owner's fields

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
  const myFields = Malaab.load("fields").filter((f) => f.ownerId === owner.id);
  console.log("my fields:", myFields);
});
