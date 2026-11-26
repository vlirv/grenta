/* =========================================================
   search.js — search page (Wael)

   TODO – build here:
   [ ] Read the fields: const fields = Malaab.load("fields");
   [ ] Hide fields with status "pending" (not approved yet by the admin)
   [ ] Draw the field cards into a container (e.g. <div id="results">)
   [ ] Read ?q= and ?date= from the URL (sent by the home page search) and fill the search box
   [ ] Filter while typing (name / area / city), by size and by price range
   [ ] Sort select: price low→high, rating, distance
   [ ] "Fields near me": navigator.geolocation.getCurrentPosition(...) then sort by distance (lat/lng in data.js)
   [ ] Show "No fields found" when the list is empty

   Shared helpers you can use (from assets/js/main.js):
     Malaab.load(key) / Malaab.save(key, value)   keys: users, fields, bookings, coupons, notifications …
     Malaab.currentUser() / Malaab.requireLogin(["owner"])
     Malaab.showAlert("#box", "message", "success")
     Malaab.validate(form)   Malaab.formatPrice(n)   Malaab.escapeHtml(text)
     Malaab.go("booking/receipt.html")
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Starter code — replace with your own
  const fields = Malaab.load("fields");
  const params = new URLSearchParams(location.search);
  console.log("search:", params.get("q"), params.get("date"), fields);
});
