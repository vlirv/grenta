/* =========================================================
   favorites.js — the player's favourite fields (Mouen)
   Click the heart on any field card to add or remove it.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin();
  if (!user) return;

  const list = document.getElementById("favList");
  const esc = Malaab.escapeHtml;

  function render() {
    const ids = Malaab.favoriteIds();
    const fields = Malaab.load("fields").filter(function (f) {
      return ids.includes(f.id) && (!f.status || f.status === "active");
    });

    if (fields.length === 0) {
      list.innerHTML =
        '<div class="col-12"><div class="panel text-center py-5">' +
        '<i class="bi bi-heart fs-1 text-danger"></i>' +
        '<p class="mt-2 mb-3">You have no favourite fields yet. Tap the heart on a field to save it here.</p>' +
        '<a href="../fields/search.html" class="btn btn-main">Find a field</a></div></div>';
      return;
    }

    list.innerHTML = fields.map(function (f) {
      const photo = f.photos && f.photos.length ? f.photos[0] : "placeholder.svg";
      return (
        '<div class="col-sm-6 col-lg-4">' +
          '<div class="card field-card h-100">' +
            Malaab.favButton(f.id) +
            '<img src="../assets/images/' + esc(photo) + '" class="card-img-top" alt="' + esc(f.name) + '">' +
            '<div class="card-body">' +
              '<h2 class="h5 card-title mb-1">' + esc(f.name) + "</h2>" +
              '<p class="text-muted-site small mb-2"><i class="bi bi-geo-alt"></i> ' +
                esc(f.city + " – " + f.area) + "</p>" +
              '<div class="d-flex justify-content-between align-items-center">' +
                '<span class="price-tag">' + Malaab.formatPrice(f.price) + " / hour</span>" +
                '<span class="d-flex gap-2">' +
                  '<a href="../fields/field.html?id=' + f.id + '" class="btn btn-outline-main btn-sm">View</a>' +
                  '<a href="../booking/booking.html?field=' + f.id + '" class="btn btn-main btn-sm">Book</a>' +
                "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  // Re-draw when a heart is clicked on this page
  document.addEventListener("malaab:favorites", render);
  render();
});
