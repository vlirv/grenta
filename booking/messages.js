/* =========================================================
   messages.js — messages page (Musab)

   TODO – build here:
   [ ] Load conversations: Malaab.load("messages") || []
   [ ] Click a conversation → show its messages as bubbles
   [ ] Send form: add message, save, re-draw, scroll to the bottom
   [ ] Enter key sends the message

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const messages = Malaab.load("messages") || [];
  console.log("messages:", messages);
});
