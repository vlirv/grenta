/* =========================================================
   my-bookings.js — my bookings page (Musab)

   TODO – build here:
   [ ] Malaab.requireLogin() and load the user's bookings
   [ ] Tabs upcoming / past / cancelled (compare the date with today)
   [ ] Draw rows with status badges: <span class="status status-confirmed">
   [ ] Cancel button: confirm(), set status "cancelled", save, re-draw
   [ ] Receipt button → receipt.html?id=ID, Message → messages.html?booking=ID

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const user = Malaab.currentUser();
  const bookings = Malaab.load("bookings").filter((b) => user && b.userId === user.id);
  console.log("my bookings:", bookings);
});
