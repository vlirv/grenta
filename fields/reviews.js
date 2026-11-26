/* =========================================================
   reviews.js — reviews page (Wael)

   TODO – build here:
   [ ] Load reviews: Malaab.load("reviews") || []
   [ ] Show the average and the count of each star (1–5) as bars
   [ ] Star picker for the review form (click a star = choose rating)
   [ ] Only allow a review if the user has a completed booking for this field (Malaab.currentUser())
   [ ] Save with Malaab.save("reviews", list) and re-draw

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const reviews = Malaab.load("reviews") || [];
  console.log("reviews:", reviews);
});
