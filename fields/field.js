/* =========================================================
   field.js — field details page (Wael)

   TODO – build here:
   [ ] Get the field id from the URL: field.html?id=1
   [ ] Find it in Malaab.load("fields") and fill name, area, price, rating, facilities
   [ ] Call button: href="tel:..."; WhatsApp button: https://wa.me/218...
   [ ] "Book now" → ../booking/booking.html?field=ID
   [ ] Show the latest 3 reviews (Malaab.load("reviews") || [])

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const id = Number(new URLSearchParams(location.search).get("id")) || 1;
  const field = Malaab.load("fields").find((f) => f.id === id);
  console.log("field:", field);
});
