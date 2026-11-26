/* =========================================================
   ticket.js — ticket page (Wael)

   TODO – build here:
   [ ] Get ticket id from the URL: ticket.html?id=1
   [ ] Show the ticket and its replies
   [ ] Reply form: add the reply, save, re-draw
   [ ] "Close ticket" button changes the status

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const id = Number(new URLSearchParams(location.search).get("id"));
  console.log("ticket id:", id);
});
