/* =========================================================
   admin-approvals.js — approvals page (Suhayib)

   TODO – build here:
   [ ] Malaab.requireLogin(["admin"])
   [ ] List users with role "owner" and status "pending", and fields with status "pending"
   [ ] (they come from account/register-owner.html – Mouen)
   [ ] Approve button only enabled when all checklist boxes are ticked
   [ ] Approve: status "active" and save; Reject: status "rejected"

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;
  const pending = Malaab.load("users").filter((u) => u.role === "owner" && u.status === "pending");
  console.log("pending owners:", pending);
});
