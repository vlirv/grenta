/* =========================================================
   receipt.js — receipt page (Musab)

   TODO – build here:
   [ ] Get booking id from the URL: receipt.html?id=1001
   [ ] Fill booking number, player, field, date, time and the price table (use Malaab.formatPrice)
   [ ] Print button: window.print()

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
  console.log("receipt for booking:", id);
});
