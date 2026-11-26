/* =========================================================
   owner-requests.js — booking requests page (Suhayib)

   TODO – build here:
   [ ] Malaab.requireLogin(["owner"]) and show pending bookings for this owner's fields
   [ ] Accept: status "confirmed" + add a notification for the player
   [ ] Reject: open a Bootstrap modal, ask a reason, status "rejected"
   [ ] Owner coupons: add / delete coupons for own fields (Malaab.load("coupons"))

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
  console.log("requests:", Malaab.load("bookings").filter((b) => b.status === "pending"));
});
