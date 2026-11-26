/* =========================================================
   owner-fields.js — my fields page (Suhayib)

   TODO – build here:
   [ ] Malaab.requireLogin(["owner"]) and list this owner's fields
   [ ] Add / edit form: validate, save to Malaab.save("fields", list)
   [ ] Photo inputs: show a preview with URL.createObjectURL(file)
   [ ] Edit button fills the form, Delete button asks confirm()

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
  console.log("owner fields page");
});
