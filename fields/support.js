/* =========================================================
   support.js — help & support page (Wael)

   TODO – build here:
   [ ] FAQ search box: hide accordion items that don't match
   [ ] Open ticket form: validate with Malaab.validate(form), save to Malaab.save("tickets", list)
   [ ] Show my tickets in a table (only the current user's)
   [ ] Ticket row click → ticket.html?id=ID

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const tickets = Malaab.load("tickets") || [];
  console.log("tickets:", tickets);
});
