/* =========================================================
   checkout.js — checkout page (Musab)

   TODO – build here:
   [ ] Read the cart: Malaab.load("cart") and show the summary
   [ ] Coupon: find code in Malaab.load("coupons"), check expiry, apply percent or fixed discount
   [ ] Payment choice: deposit (e.g. 30%) / full / at field → update total, paid, remaining
   [ ] Card form (demo): 16 digits, MM/YY, 3-digit CVV; card ending 0002 = declined
   [ ] 10-minute countdown with setInterval; when it reaches 0 → back to booking.html
   [ ] On pay: add the booking to Malaab.load("bookings"), save, go to receipt.html?id=ID

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const cart = Malaab.load("cart");
  console.log("cart:", cart, "coupons:", Malaab.load("coupons"));
});
